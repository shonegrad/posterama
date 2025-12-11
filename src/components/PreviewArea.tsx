import { Slider } from './ui/slider';
import { ZoomIn, ZoomOut, RotateCcw, Move, MousePointer2 } from 'lucide-react';
import { Button } from './ui/button';
import { ZOOM_MIN, ZOOM_MAX } from '../lib/constants';

interface PreviewAreaProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  zoomLevel: number;
  panOffset: { x: number; y: number };
  showPreview: boolean;
  isZoomMode: boolean;
  isPanMode: boolean;
  onCanvasClick: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onPreviewMouseDown: (e: React.MouseEvent) => void;
  onPreviewMouseMove: (e: React.MouseEvent) => void;
  onPreviewMouseUp: () => void;
  getCurrentCursor: () => string;
  onZoomChange: (zoom: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onToggleZoomMode: () => void;
  onTogglePanMode: () => void;

}

export function PreviewArea({
  canvasRef,
  zoomLevel,
  panOffset,
  showPreview,
  isZoomMode,
  isPanMode,
  onCanvasClick,
  onPreviewMouseDown,
  onPreviewMouseMove,
  onPreviewMouseUp,
  getCurrentCursor,
  onZoomChange,
  onZoomIn,
  onZoomOut,
  onResetView,
  onToggleZoomMode,
  onTogglePanMode,

}: PreviewAreaProps) {

  // Logarithmic slider scale for smoother feeling
  // Slider range: 0 to 100

  // Convert zoom level to slider value (0-100)
  const zoomToSlider = (zoom: number) => {
    if (!zoom || isNaN(zoom) || !isFinite(zoom) || zoom <= 0) return 0;

    // Basic logarithmic mapping: val = log(zoom / min) / log(max / min)
    const logZoom = Math.log(Math.max(zoom, ZOOM_MIN) / ZOOM_MIN);
    const logMax = Math.log(ZOOM_MAX / ZOOM_MIN);
    return (logZoom / logMax) * 100;
  };

  // Convert slider value (0-100) to zoom level
  const sliderToZoom = (value: number) => {
    const logMax = Math.log(ZOOM_MAX / ZOOM_MIN);
    const logZoom = (value / 100) * logMax;
    return ZOOM_MIN * Math.exp(logZoom);
  };

  const handleSliderChange = (value: number[]) => {
    const newZoom = sliderToZoom(value[0]);
    onZoomChange(newZoom);
  };
  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Preview Container - Fixed positioning for canvas */}
      <div
        className="flex-1 rounded bg-muted/10 relative shadow-inner overflow-hidden"
        style={{
          cursor: getCurrentCursor(),
          minHeight: '500px',
          // Enable GPU acceleration
          willChange: 'transform',
          contain: 'layout style paint'
        }}
        onMouseDown={onPreviewMouseDown}
        onMouseMove={onPreviewMouseMove}
        onMouseUp={onPreviewMouseUp}
        onMouseLeave={onPreviewMouseUp}
        onWheel={(e) => {
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = -e.deltaY * 0.005;
            const newZoom = Math.min(Math.max(zoomLevel * (1 + delta), ZOOM_MIN), ZOOM_MAX);
            onZoomChange(newZoom);
          }
        }}
      >
        {/* Canvas Container - Top-left aligned so size changes are visible */}
        <div className="absolute inset-0 flex items-center justify-center p-8 overflow-auto">
          <canvas
            ref={canvasRef}
            className="block"
            style={{
              transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
              transformOrigin: 'center center',
              opacity: showPreview ? 1 : 0.5,
              pointerEvents: isZoomMode ? 'auto' : 'none',
              imageRendering: zoomLevel > 2 ? 'pixelated' : 'auto',
              display: 'block',
              willChange: 'transform',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              WebkitTransform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
              // Smooth transitions for zoom changes
              transition: isPanMode ? 'none' : 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              // Checkered background for transparency
              backgroundColor: '#ffffff',
              backgroundImage: 'linear-gradient(45deg, #e0e0e0 25%, transparent 25%, transparent 75%, #e0e0e0 75%, #e0e0e0), linear-gradient(45deg, #e0e0e0 25%, transparent 25%, transparent 75%, #e0e0e0 75%, #e0e0e0)',
              backgroundPosition: '0 0, 10px 10px',
              backgroundSize: '20px 20px'
            }}
            onClick={onCanvasClick}
          />
        </div>
      </div>

      {/* Zoom Controls Overlay */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center">
        <div className="flex items-center gap-3 p-3 surface-container-high rounded elevation-2 border border-border/50 backdrop-blur-sm">
          {/* Zoom Out Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onZoomOut}
            className="h-8 w-8 p-0 hover:surface-container-highest"
            title="Zoom Out (Alt+Z)"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>

          {/* Separator */}
          <div className="w-px h-6 bg-border mx-1" />

          {/* Pan Mode (Hand Tool) */}
          <Button
            variant={isPanMode ? "default" : "ghost"}
            size="sm"
            onClick={onTogglePanMode}
            className={`h-8 w-8 p-0 ${isPanMode ? "bg-primary text-primary-foreground" : "hover:surface-container-highest"}`}
            title="Hand Tool (Space)"
            aria-label="Hand Tool"
          >
            <Move className="w-4 h-4" />
          </Button>

          {/* Zoom Mode */}
          <Button
            variant={isZoomMode ? "default" : "ghost"}
            size="sm"
            onClick={onToggleZoomMode}
            className={`h-8 w-8 p-0 ${isZoomMode ? "bg-primary text-primary-foreground" : "hover:surface-container-highest"}`}
            title="Zoom Tool (Z)"
            aria-label="Zoom Tool"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>

          {/* Separator */}
          <div className="w-px h-6 bg-border mx-1" />

          {/* Zoom Slider */}
          <div className="flex items-center gap-2 min-w-32">
            <Slider
              value={[zoomToSlider(zoomLevel)]}
              onValueChange={handleSliderChange}
              max={100}
              min={0}
              step={0.5}
              className="flex-1 w-32 cursor-pointer"
            />
          </div>

          {/* Zoom In Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onZoomIn}
            className="h-8 w-8 p-0 hover:surface-container-highest"
            title="Zoom In (Z)"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>

          {/* Zoom Level Display */}
          <div className="text-xs text-muted-foreground font-medium min-w-16 text-center tabular-nums">
            {Math.round(zoomLevel * 100)}%
          </div>

          {/* Reset View Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetView}
            className="h-8 w-8 p-0 hover:surface-container-highest"
            title="Reset View (R)"
            aria-label="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>


        </div>
      </div>

    </div>
  );
}