import { ThresholdAlgorithm, ColorSwatch, ALGORITHM_INFO, COLOR_PRESETS } from '../lib/constants';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

import { Palette, Undo, Redo } from 'lucide-react';

interface ControlsPanelProps {
  algorithm: ThresholdAlgorithm;
  onAlgorithmChange: (algorithm: ThresholdAlgorithm) => void;
  onApplyPreset: (presetName: keyof typeof COLOR_PRESETS) => void;
  colorPalette: ColorSwatch[];
  selectedLayer: number;
  getLayerName: (index: number) => string;
  onApplyColor: (layerIndex: number, field: keyof any, value: any) => void;
  updateStatus: (status: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function ControlsPanel({
  algorithm,
  onAlgorithmChange,
  onApplyPreset,
  colorPalette,
  selectedLayer,
  getLayerName,
  onApplyColor,
  updateStatus,
  undo,
  redo,
  canUndo,
  canRedo
}: ControlsPanelProps) {


  // Ensure algorithm is valid, fallback to 'atkinson' if not
  const activeAlgorithm = ALGORITHM_INFO[algorithm] ? algorithm : 'atkinson';

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium">Algorithm Settings</h4>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={undo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            aria-label="Undo last action"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={redo}
            disabled={!canRedo}
            title="Redo (Ctrl+Shift+Z)"
            aria-label="Redo last action"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="rounded transition-all duration-200 elevation-2 border border-border surface-container hover:elevation-3 hover:surface-container-high hover:bg-surface-container-highest transition-colors">

        <div className="p-3">
          <div className="space-y-3">
            {/* Algorithm Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Algorithm</Label>

              <Select
                value={activeAlgorithm}
                onValueChange={(value: ThresholdAlgorithm) => {
                  onAlgorithmChange(value);
                  updateStatus(`Switched to ${ALGORITHM_INFO[value].name}`);
                }}
              >
                <SelectTrigger className="h-8 text-sm w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple" className="text-sm">Simple Threshold</SelectItem>
                  <SelectItem value="atkinson" className="text-sm">Atkinson Dither</SelectItem>
                  <SelectItem value="floyd-steinberg" className="text-sm">Floyd-Steinberg</SelectItem>
                  <SelectItem value="false-floyd-steinberg" className="text-sm">False Floyd-Steinberg</SelectItem>
                  <SelectItem value="sierra" className="text-sm">Sierra Dither</SelectItem>
                  <SelectItem value="sierra-lite" className="text-sm">Sierra Lite</SelectItem>
                  <SelectItem value="burkes" className="text-sm">Burkes Dither</SelectItem>
                  <SelectItem value="stucki" className="text-sm">Stucki Dither</SelectItem>
                  <SelectItem value="jarvis-judice-ninke" className="text-sm">Jarvis-Judice-Ninke</SelectItem>
                  <SelectItem value="riemersma" className="text-sm">Riemersma Dither</SelectItem>
                  <SelectItem value="ordered-dither" className="text-sm">Ordered Dither</SelectItem>
                </SelectContent>
              </Select>

              <div
                className="text-sm text-muted-foreground bg-surface-container-high hover:bg-surface-container-highest transition-colorsest/50 p-2 rounded"
                style={{ marginLeft: '10px' }}
              >
                <span className="font-semibold text-primary">{ALGORITHM_INFO[activeAlgorithm]?.name}: </span>
                {ALGORITHM_INFO[activeAlgorithm]?.description || 'No description available'}
              </div>
            </div>

            {/* Color Presets - Clickable list */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Color Presets
              </Label>

              <div className="flex flex-col gap-2">
                {Object.entries(COLOR_PRESETS).map(([presetKey, preset]) => (
                  <Button
                    key={presetKey}
                    variant="outline"
                    size="sm"
                    className="h-8 text-sm elevation-1 border-0 surface-container-high hover:bg-surface-container-highest transition-colors hover:surface-container-high hover:bg-surface-container-highest transition-colorsest transition-all duration-200 justify-start"
                    onClick={() => {
                      onApplyPreset(presetKey as keyof typeof COLOR_PRESETS);
                      updateStatus(`Applied ${preset.name} color preset`);
                    }}
                    title={`Apply ${preset.name} color preset`}
                    aria-label={`Apply ${preset.name} color preset`}
                  >
                    <div className="flex items-center gap-2 w-full">
                      {/* Color preview dots */}
                      <div className="flex gap-1" aria-hidden="true">
                        {preset.layers.slice(0, 3).map((layer, index) => (
                          <div
                            key={index}
                            className="w-2 h-2 rounded-full border border-border/50"
                            style={{ backgroundColor: layer.color }}
                          />
                        ))}
                      </div>
                      <span className="truncate">{preset.name}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Extracted Colors - Moved below presets, smaller size, no icons */}
            {colorPalette.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Extracted Colors</Label>
                <div className="flex gap-1 flex-wrap">
                  {colorPalette.map((swatch, index) => (
                    <div
                      key={index}
                      className="cursor-pointer hover:scale-125 transition-all duration-200 ease-out flex-shrink-0 hover:shadow-xl hover:shadow-primary/40 dark:hover:shadow-primary/60 active:scale-110"
                      onClick={() => {
                        onApplyColor(selectedLayer, 'color', swatch.color);
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          onApplyColor(selectedLayer, 'color', swatch.color);
                        }
                      }}
                      title={`Apply ${swatch.color} to ${getLayerName(selectedLayer)} (${swatch.percentage}%)`}
                      aria-label={`Apply color ${swatch.color} to ${getLayerName(selectedLayer)}`}
                    >
                      <div
                        className="w-5 h-5 rounded elevation-1 border-2 border-border/50 hover:border-primary/80"
                        style={{ backgroundColor: swatch.color }}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Click to apply to {getLayerName(selectedLayer)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}