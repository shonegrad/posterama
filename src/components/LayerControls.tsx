import { LayerConfig } from '../lib/constants';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Toggle } from './ui/toggle';
import { RotateCcw, Eye, EyeOff, ChevronDown, ChevronUp, Trash2, Grid3x3, ArrowUp, ArrowDown } from 'lucide-react';
import { Switch } from './ui/switch';
import { useEffect, useRef, useState, useCallback } from 'react';

interface LayerControlsProps {
  layers: LayerConfig[];
  selectedLayer: number;
  showPreview: boolean;
  onLayerUpdate: (index: number, field: keyof LayerConfig, value: number | string | boolean) => void;
  onLayerSelect: (index: number) => void;
  onLayerCollapse: (index: number) => void;
  onLayerColorClick: (index: number, e: React.MouseEvent) => void;
  onResetLayers: () => void;
  onTogglePreview: () => void;
  generateSmartFilename: () => string;
  isOptimized: boolean;
  onAddLayer: () => void;
  onDeleteLayer: (index: number) => void;
  onReorderLayer: (fromIndex: number, toIndex: number) => void;
}

export function LayerControls({
  layers,
  selectedLayer,
  showPreview,
  onLayerUpdate,
  onLayerSelect,
  onLayerCollapse,
  onLayerColorClick,
  onResetLayers,
  onTogglePreview,
  generateSmartFilename,
  isOptimized,
  onAddLayer,
  onDeleteLayer,
  onReorderLayer
}: LayerControlsProps) {
  const colorPickerRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Temporary states for immediate UI updates
  const [tempThresholds, setTempThresholds] = useState<{ [key: number]: number }>({});
  const [tempOpacities, setTempOpacities] = useState<{ [key: number]: number }>({});
  const [tempColors, setTempColors] = useState<{ [key: number]: string }>({});
  const [tempPatternSizes, setTempPatternSizes] = useState<{ [key: number]: number }>({});
  const [tempPatternRotations, setTempPatternRotations] = useState<{ [key: number]: number }>({});
  const [tempPatternFgColors, setTempPatternFgColors] = useState<{ [key: number]: string }>({});
  const [tempPatternBgColors, setTempPatternBgColors] = useState<{ [key: number]: string }>({});
  const [tempPatternSpacings, setTempPatternSpacings] = useState<{ [key: number]: number }>({});

  // Track drag state for color pickers
  const [isDragging, setIsDragging] = useState(false);
  const mouseDownPosRef = useRef<{ x: number; y: number } | null>(null);

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
  const getDisplayValue = (index: number, field: string, actualValue: any) => {
    switch (field) {
      case 'threshold':
        return tempThresholds[index] !== undefined ? tempThresholds[index] : actualValue;
      case 'opacity':
        return tempOpacities[index] !== undefined ? tempOpacities[index] : actualValue;
      case 'color':
        return tempColors[index] !== undefined ? tempColors[index] : actualValue;
      case 'patternSize':
        return tempPatternSizes[index] !== undefined ? tempPatternSizes[index] : actualValue;
      case 'patternRotation':
        return tempPatternRotations[index] !== undefined ? tempPatternRotations[index] : actualValue;
      case 'patternForegroundColor':
        return tempPatternFgColors[index] !== undefined ? tempPatternFgColors[index] : actualValue;
      case 'patternBackgroundColor':
        return tempPatternBgColors[index] !== undefined ? tempPatternBgColors[index] : actualValue;
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

  const handleColorChange = useCallback((index: number, value: string) => {
    setTempColors(prev => ({ ...prev, [index]: value }));
    debouncedUpdate(index, 'color', value, 100); // Shorter delay for colors
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

  const handlePatternFgColorChange = useCallback((index: number, value: string) => {
    setTempPatternFgColors(prev => ({ ...prev, [index]: value }));
    debouncedUpdate(index, 'patternForegroundColor', value, 100);
  }, [debouncedUpdate]);

  const handlePatternBgColorChange = useCallback((index: number, value: string) => {
    setTempPatternBgColors(prev => ({ ...prev, [index]: value }));
    debouncedUpdate(index, 'patternBackgroundColor', value, 100);
  }, [debouncedUpdate]);

  // Note: Native color pickers handle their own closing behavior automatically
  // No manual close handling needed

  // Clear temporary states when layers change externally (like presets)
  useEffect(() => {
    // Use requestAnimationFrame to clear temp states smoothly
    requestAnimationFrame(() => {
      setTempThresholds({});
      setTempOpacities({});
      setTempColors({});
      setTempPatternSizes({});
      setTempPatternRotations({});
      setTempPatternFgColors({});
      setTempPatternBgColors({});
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

  const handleLayerColorClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onLayerColorClick(index, e);

    // Only open color picker if not dragging
    if (!isDragging) {
      // Focus the color picker to open it
      const colorPicker = colorPickerRefs.current[index];
      if (colorPicker) {
        colorPicker.focus();
        colorPicker.click();
      }
    }
  };

  // Track mouse position to detect dragging
  const handleColorMouseDown = (e: React.MouseEvent) => {
    mouseDownPosRef.current = { x: e.clientX, y: e.clientY };
    setIsDragging(false);
  };

  const handleColorMouseMove = (e: React.MouseEvent) => {
    if (mouseDownPosRef.current) {
      const dx = e.clientX - mouseDownPosRef.current.x;
      const dy = e.clientY - mouseDownPosRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // If moved more than 5 pixels, consider it a drag
      if (distance > 5) {
        setIsDragging(true);
      }
    }
  };

  const handleColorMouseUp = () => {
    mouseDownPosRef.current = null;
    // Reset dragging state after a short delay
    setTimeout(() => setIsDragging(false), 100);
  };

  // Helper for pattern color clicks
  const handlePatternColorClick = (inputId: string) => {
    if (!isDragging) {
      const input = document.getElementById(inputId) as HTMLInputElement;
      if (input) input.click();
    }
  };

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
            className="flex items-center gap-1 elevation-1 border-0 surface-container-high hover:bg-surface-container-highest transition-colors hover:surface-container-high hover:bg-surface-container-highest transition-colorsest text-sm h-6 px-2"
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
            className="flex items-center gap-1 elevation-1 border-0 surface-container-high hover:bg-surface-container-highest transition-colors hover:surface-container-high hover:bg-surface-container-highest transition-colorsest text-sm h-6 px-2"
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
                ? 'elevation-3 border-2 border-primary/40 surface-container-high hover:bg-surface-container-highest transition-colorsest ring-2 ring-primary/30'
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
                          onValueChange={(value: any) => onLayerUpdate(index, 'blendMode', value)}
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
                            {getDisplayValue(index, 'threshold', layer.threshold)}
                          </span>
                        </div>
                        <Slider
                          value={[getDisplayValue(index, 'threshold', layer.threshold) || 128]}
                          onValueChange={(value) => handleThresholdChange(index, value[0])}
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
                          {getDisplayValue(index, 'opacity', layer.opacity)}%
                        </span>
                      </div>
                      <Slider
                        value={[getDisplayValue(index, 'opacity', layer.opacity)]}
                        onValueChange={(value) => handleOpacityChange(index, value[0])}
                        max={100}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    {/* Row 4: Pattern Toggle */}
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium font-mono">Pattern</Label>
                      <Toggle
                        pressed={layer.usePattern || false}
                        onPressedChange={(pressed) => onLayerUpdate(index, 'usePattern', pressed)}
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground border-border"
                        aria-label="Toggle pattern"
                      >
                        <Grid3x3 className="h-4 w-4" />
                      </Toggle>
                    </div>

                    {/* Pattern Selection - Only show if pattern mode is enabled */}
                    {layer.usePattern && (
                      <div className="space-y-2 pt-2">
                        <Select
                          value={layer.pattern}
                          onValueChange={(value: LayerConfig['pattern']) => onLayerUpdate(index, 'pattern', value)}
                        >
                          <SelectTrigger className="elevation-1 border-0 h-7 surface-container-high hover:bg-surface-container-highest transition-colors text-sm text-center">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="surface-container-high hover:bg-surface-container-highest transition-colorsest elevation-3 border-0">
                            <SelectItem value="halftone">Halftone Dots</SelectItem>
                            <SelectItem value="screentone">Screentone Lines</SelectItem>
                            <SelectItem value="dots">Simple Dots</SelectItem>
                            <SelectItem value="lines">Grid Lines</SelectItem>
                            <SelectItem value="waves">Wave Pattern</SelectItem>
                            <SelectItem value="hexagon">Hexagon Grid</SelectItem>
                            <SelectItem value="brick">Brick Pattern</SelectItem>
                            <SelectItem value="fabric">Fabric Weave</SelectItem>
                            <SelectItem value="noise">Grunge Noise</SelectItem>
                            <SelectItem value="crosshatch">Crosshatch</SelectItem>
                            <SelectItem value="stippling">Stippling</SelectItem>
                            <SelectItem value="newspaper">Newspaper Print</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

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
                            onValueChange={(value) => handlePatternSizeChange(index, value[0])}
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
                            onValueChange={(value) => handlePatternSpacingChange(index, value[0])}
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
                            onValueChange={(value) => handlePatternRotationChange(index, value[0])}
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