import { LayerConfig } from '../lib/constants';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { RotateCcw, Eye, EyeOff, ChevronDown, ChevronUp, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { useEffect, useRef, useState, useCallback } from 'react';

interface LayerControlsProps {
  layers: LayerConfig[];
  selectedLayer: number;
  onLayerUpdate: (index: number, field: keyof LayerConfig, value: number | string | boolean) => void;
  onLayerSelect: (index: number) => void;
  onLayerCollapse: (index: number) => void;
  onResetLayers: () => void;
  isOptimized: boolean;
  onAddLayer: () => void;
  onDeleteLayer: (index: number) => void;
  onReorderLayer: (fromIndex: number, toIndex: number) => void;
}

export function LayerControls({
  layers,
  selectedLayer,
  onLayerUpdate,
  onLayerSelect,
  onLayerCollapse,
  onResetLayers,
  isOptimized,
  onAddLayer,
  onDeleteLayer,
  onReorderLayer
}: LayerControlsProps) {
  // Temporary states for immediate UI updates
  const [tempThresholds, setTempThresholds] = useState<{ [key: number]: number }>({});
  const [tempOpacities, setTempOpacities] = useState<{ [key: number]: number }>({});
  const [tempPatternSizes, setTempPatternSizes] = useState<{ [key: number]: number }>({});
  const [tempPatternRotations, setTempPatternRotations] = useState<{ [key: number]: number }>({});
  const [tempPatternSpacings, setTempPatternSpacings] = useState<{ [key: number]: number }>({});

  // Debounce timers
  const debounceTimersRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

  const getLayerName = (index: number): string => {
    if (index === layers.length - 1) return 'Background';
    // Count from bottom: Layer 1 is just above background, Layer 2 is above that
    const layerNumber = (layers.length - 1) - index;
    return `Layer ${layerNumber}`;
  };

  const isBackgroundLayer = (index: number): boolean => {
    return index === layers.length - 1;
  };

  const toggleLayerVisibility = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onLayerUpdate(index, 'visible', !layers[index].visible);
  };

  // Debounced update function
  const debouncedUpdate = useCallback((
    index: number,
    field: keyof LayerConfig,
    value: number | string | boolean,
    delay: number = 150
  ) => {
    const key = `${index}-${field}`;

    // Clear existing timer
    if (debounceTimersRef.current[key]) {
      clearTimeout(debounceTimersRef.current[key]);
    }

    // Set new timer
    debounceTimersRef.current[key] = setTimeout(() => {
      onLayerUpdate(index, field, value);
      delete debounceTimersRef.current[key];
    }, delay);
  }, [onLayerUpdate]);

  // Get display value (temp value if exists, otherwise actual value)
  const getDisplayValue = (index: number, field: string, actualValue: number) => {
    switch (field) {
      case 'threshold':
        return tempThresholds[index] !== undefined ? tempThresholds[index] : actualValue;
      case 'opacity':
        return tempOpacities[index] !== undefined ? tempOpacities[index] : actualValue;
      case 'patternSize':
        return tempPatternSizes[index] !== undefined ? tempPatternSizes[index] : actualValue;
      case 'patternRotation':
        return tempPatternRotations[index] !== undefined ? tempPatternRotations[index] : actualValue;
      case 'patternSpacing':
        return tempPatternSpacings[index] !== undefined ? tempPatternSpacings[index] : actualValue;
      default:
        return actualValue;
    }
  };

  // Handlers for immediate UI updates + debounced processing
  const handleThresholdChange = useCallback((index: number, value: number) => {
    setTempThresholds(prev => ({ ...prev, [index]: value }));
    debouncedUpdate(index, 'threshold', value);
  }, [debouncedUpdate]);

  const handleOpacityChange = useCallback((index: number, value: number) => {
    setTempOpacities(prev => ({ ...prev, [index]: value }));
    debouncedUpdate(index, 'opacity', value);
  }, [debouncedUpdate]);

  const handlePatternSizeChange = useCallback((index: number, value: number) => {
    setTempPatternSizes(prev => ({ ...prev, [index]: value }));
    debouncedUpdate(index, 'patternSize', value);
  }, [debouncedUpdate]);

  const handlePatternSpacingChange = useCallback((index: number, value: number) => {
    setTempPatternSpacings(prev => ({ ...prev, [index]: value }));
    debouncedUpdate(index, 'patternSpacing', value);
  }, [debouncedUpdate]);

  const handlePatternRotationChange = useCallback((index: number, value: number) => {
    setTempPatternRotations(prev => ({ ...prev, [index]: value }));
    debouncedUpdate(index, 'patternRotation', value);
  }, [debouncedUpdate]);

  // Clear temporary states when layers change externally (like presets)
  useEffect(() => {
    // Use requestAnimationFrame to clear temp states smoothly
    requestAnimationFrame(() => {
      setTempThresholds({});
      setTempOpacities({});
      setTempPatternSizes({});
      setTempPatternRotations({});
      setTempPatternSpacings({});
    });
  }, [layers]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimersRef.current).forEach(timer => {
        if (timer) clearTimeout(timer);
      });
    };
  }, []);

  return (
    <div className="p-4">
      <div className="mb-4 space-y-3">
        {/* Title Row */}
        <h4 className="text-sm font-medium">Layer Settings</h4>

        {/* Action Buttons Row */}
        <div className="flex items-center gap-2">
          <Button
            onClick={onAddLayer}
            variant="outline"
            size="sm"
            className="flex items-center gap-1 elevation-1 border-0 surface-container-high hover:bg-surface-container-highest transition-colors hover:surface-container-high hover:bg-surface-container-highest transition-colors text-sm h-6 px-2"
            title="Add a new layer"
            aria-label="Add a new layer"
          >
            <span className="text-sm leading-none">+</span>
            Add
          </Button>
          <Button
            onClick={onResetLayers}
            variant="outline"
            size="sm"
            className="flex items-center gap-1 elevation-1 border-0 surface-container-high hover:bg-surface-container-highest transition-colors hover:surface-container-high hover:bg-surface-container-highest transition-colors text-sm h-6 px-2"
            title="Reset layers to default (Ctrl+R)"
            aria-label="Reset layers to default"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </Button>
        </div>
      </div>

      {/* Layer Controls */}
      <div className="space-y-3">
        {layers.map((layer, index) => {
          const isCollapsed = layer.collapsed || false; // All panels expanded by default
          const isVisible = layer.visible !== false; // Default to true if undefined

          return (
            <div
              key={`layer-${index}`}
              className={`rounded transition-all duration-200 ease-out ${selectedLayer === index
                ? 'elevation-3 border-2 border-primary/40 surface-container-high hover:bg-surface-container-highest transition-colors ring-2 ring-primary/30'
                : 'elevation-2 border border-border surface-container hover:elevation-4 hover:surface-container-high hover:bg-surface-container-highest transition-colors hover:scale-[1.008] hover:shadow-lg hover:shadow-primary/10 dark:hover:shadow-primary/20'
                }`}
            >
              {/* Layer content */}
              <div className="p-3 space-y-3">
                {/* Row 1: Layer Name + Action Buttons */}
                <div className="flex items-center justify-between gap-2">
                  {/* Layer Name */}
                  <div className="flex items-center gap-2 flex-1">
                    {/* Color Thumbnail / Picker */}
                    <div className="relative w-6 h-6 rounded-full border border-border cursor-pointer shadow-sm flex-shrink-0 group">
                      <input
                        type="color"
                        value={layer.color}
                        onChange={(e) => onLayerUpdate(index, 'color', e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-full"
                        title="Change layer color"
                      />
                      <div className="w-full h-full rounded-full pointer-events-none" style={{ backgroundColor: layer.color }} />
                    </div>

                    <Label className="text-sm font-medium cursor-pointer font-mono" onClick={() => onLayerSelect(index)}>
                      {getLayerName(index)}
                    </Label>
                    {selectedLayer === index && (
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    )}
                  </div>

                  {/* Action buttons - Right side */}
                  <div className="flex items-center gap-1">
                    {/* Visibility Toggle */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`p-1.5 h-6 w-6 hover:bg-primary/10 ${!isVisible ? 'opacity-50' : ''}`}
                      onClick={(e) => toggleLayerVisibility(index, e)}
                      title={`${isVisible ? 'Hide' : 'Show'} ${getLayerName(index)}`}
                      aria-label={`${isVisible ? 'Hide' : 'Show'} ${getLayerName(index)}`}
                    >
                      {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </Button>

                    {/* Reorder Buttons (not for background) */}
                    {!isBackgroundLayer(index) && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1.5 h-6 w-6 hover:bg-primary/10 disabled:opacity-30"
                          onClick={(e) => {
                            e.stopPropagation();
                            onReorderLayer(index, index - 1);
                          }}
                          disabled={index === 0}
                          title={`Move ${getLayerName(index)} up`}
                          aria-label={`Move ${getLayerName(index)} up`}
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1.5 h-6 w-6 hover:bg-primary/10 disabled:opacity-30"
                          onClick={(e) => {
                            e.stopPropagation();
                            onReorderLayer(index, index + 1);
                          }}
                          disabled={index >= layers.length - 2}
                          title={`Move ${getLayerName(index)} down`}
                          aria-label={`Move ${getLayerName(index)} down`}
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </Button>
                      </>
                    )}

                    {/* Delete Button (not for background) */}
                    {!isBackgroundLayer(index) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1.5 h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteLayer(index);
                        }}
                        title={`Delete ${getLayerName(index)}`}
                        aria-label={`Delete ${getLayerName(index)}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}

                    {/* Collapse Arrow */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1.5 h-6 w-6 hover:bg-primary/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        onLayerCollapse(index);
                      }}
                      aria-label={isCollapsed ? `Expand ${getLayerName(index)}` : `Collapse ${getLayerName(index)}`}
                    >
                      {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                    </Button>
                  </div>
                </div>

                {/* Collapsible Content */}
                {!isCollapsed && (
                  <div className="space-y-3">
                    {/* Row 1.5: Blend Mode - Hidden for background layer */}
                    {!isBackgroundLayer(index) && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label className="text-sm font-medium font-mono">Blend Mode</Label>
                        </div>
                        <Select
                          value={layer.blendMode}
                          onValueChange={(value: string) => onLayerUpdate(index, 'blendMode', value as LayerConfig['blendMode'])}
                        >
                          <SelectTrigger className="h-7 text-sm w-full elevation-1 border-0 surface-container-high hover:bg-surface-container-highest transition-colors">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="normal" className="text-sm">Normal</SelectItem>
                            <SelectItem value="multiply" className="text-sm">Multiply</SelectItem>
                            <SelectItem value="screen" className="text-sm">Screen</SelectItem>
                            <SelectItem value="overlay" className="text-sm">Overlay</SelectItem>
                            <SelectItem value="darken" className="text-sm">Darken</SelectItem>
                            <SelectItem value="lighten" className="text-sm">Lighten</SelectItem>
                            <SelectItem value="color-dodge" className="text-sm">Color Dodge</SelectItem>
                            <SelectItem value="color-burn" className="text-sm">Color Burn</SelectItem>
                            <SelectItem value="hard-light" className="text-sm">Hard Light</SelectItem>
                            <SelectItem value="soft-light" className="text-sm">Soft Light</SelectItem>
                            <SelectItem value="difference" className="text-sm">Difference</SelectItem>
                            <SelectItem value="exclusion" className="text-sm">Exclusion</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Row 2: Threshold - Hidden for background layer */}
                    {!isBackgroundLayer(index) && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label className="text-sm font-medium font-mono">Threshold</Label>
                          <span className="text-xs text-muted-foreground font-mono">
                            {getDisplayValue(index, 'threshold', layer.threshold ?? 128)}
                          </span>
                        </div>
                        <Slider
                          value={[getDisplayValue(index, 'threshold', layer.threshold ?? 128) || 128]}
                          onValueChange={(value) => handleThresholdChange(index, value[0] ?? 128)}
                          max={255}
                          min={0}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    )}

                    {/* Row 3: Opacity */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm font-medium font-mono">Opacity</Label>
                        <span className="text-xs text-muted-foreground font-mono">
                          {getDisplayValue(index, 'opacity', layer.opacity ?? 100)}%
                        </span>
                      </div>
                      <Slider
                        value={[getDisplayValue(index, 'opacity', layer.opacity ?? 100)]}
                        onValueChange={(value) => handleOpacityChange(index, value[0] ?? 100)}
                        max={100}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    {/* Row 4: Pattern selector (None = plain color fill) */}
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium font-mono flex-shrink-0">Pattern</Label>
                      <Select
                        value={layer.pattern}
                        onValueChange={(value: LayerConfig['pattern']) => {
                          // Keep the usePattern flag in sync with the dropdown
                          onLayerUpdate(index, 'usePattern', value !== 'none');
                          onLayerUpdate(index, 'pattern', value);
                        }}
                      >
                        <SelectTrigger className="elevation-1 border-0 h-7 surface-container-high hover:bg-surface-container-highest transition-colors text-sm flex-1 min-w-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="surface-container-high hover:bg-surface-container-highest transition-colors elevation-3 border-0">
                          <SelectItem value="none" className="text-sm">None</SelectItem>
                          <SelectItem value="halftone" className="text-sm">Halftone Dots</SelectItem>
                          <SelectItem value="screentone" className="text-sm">Screentone Lines</SelectItem>
                          <SelectItem value="dots" className="text-sm">Simple Dots</SelectItem>
                          <SelectItem value="lines" className="text-sm">Grid Lines</SelectItem>
                          <SelectItem value="waves" className="text-sm">Wave Pattern</SelectItem>
                          <SelectItem value="hexagon" className="text-sm">Hexagon Grid</SelectItem>
                          <SelectItem value="brick" className="text-sm">Brick Pattern</SelectItem>
                          <SelectItem value="fabric" className="text-sm">Fabric Weave</SelectItem>
                          <SelectItem value="noise" className="text-sm">Grunge Noise</SelectItem>
                          <SelectItem value="crosshatch" className="text-sm">Crosshatch</SelectItem>
                          <SelectItem value="stippling" className="text-sm">Stippling</SelectItem>
                          <SelectItem value="newspaper" className="text-sm">Newspaper Print</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Pattern Controls - Only show if pattern mode is enabled */}
                    {layer.usePattern && layer.pattern !== 'none' && (
                      <>
                        {/* Pattern Size */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label className="text-sm font-medium font-mono">Pattern Size</Label>
                            <span className="text-xs text-muted-foreground font-mono">
                              {getDisplayValue(index, 'patternSize', layer.patternSize)}px
                            </span>
                          </div>
                          <Slider
                            value={[getDisplayValue(index, 'patternSize', layer.patternSize)]}
                            onValueChange={(value) => handlePatternSizeChange(index, value[0] ?? layer.patternSize)}
                            max={200}
                            min={2}
                            step={1}
                            className="w-full"
                          />
                        </div>

                        {/* Pattern Spacing */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label className="text-sm font-medium font-mono">Spacing</Label>
                            <span className="text-xs text-muted-foreground font-mono">
                              {getDisplayValue(index, 'patternSpacing', layer.patternSpacing || 0)}px
                            </span>
                          </div>
                          <Slider
                            value={[getDisplayValue(index, 'patternSpacing', layer.patternSpacing || 0)]}
                            onValueChange={(value) => handlePatternSpacingChange(index, value[0] ?? (layer.patternSpacing || 0))}
                            max={50}
                            min={0}
                            step={1}
                            className="w-full"
                          />
                        </div>

                        {/* Pattern Rotation */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label className="text-sm font-medium font-mono">Pattern Rotation</Label>
                            <span className="text-xs text-muted-foreground font-mono">
                              {getDisplayValue(index, 'patternRotation', layer.patternRotation)}°
                            </span>
                          </div>
                          <Slider
                            value={[getDisplayValue(index, 'patternRotation', layer.patternRotation)]}
                            onValueChange={(value) => handlePatternRotationChange(index, value[0] ?? layer.patternRotation)}
                            max={360}
                            min={0}
                            step={1}
                            className="w-full"
                          />
                        </div>
                      </>
                    )}
                  </div>
                )
                }
              </div>
            </div>
          );
        })}
      </div >

      {/* Export info below layers */}
      {isOptimized && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-primary text-center">
            Full resolution will be used for export
          </p>
        </div>
      )}
    </div >
  );
}