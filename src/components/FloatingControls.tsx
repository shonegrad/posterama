import { Button } from './ui/button';
import { Card } from './ui/card';
import { ZoomIn, ZoomOut, Move, RotateCcw, Maximize } from 'lucide-react';

interface FloatingControlsProps {
  zoomLevel: number;
  isZoomMode: boolean;
  isPanMode: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleZoomMode: () => void;
  onTogglePanMode: () => void;
  onResetView: () => void;
  onFitToScreen?: () => void;
}

export function FloatingControls({
  zoomLevel,
  isZoomMode,
  isPanMode,
  onZoomIn,
  onZoomOut,
  onToggleZoomMode,
  onTogglePanMode,
  onResetView,
  onFitToScreen
}: FloatingControlsProps) {
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <Card className="elevation-3 surface-container-high border-0 p-2">
        <div className="flex items-center gap-1">
          {/* Zoom Out */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onZoomOut}
            disabled={zoomLevel <= 0.5}
            className="h-9 w-9 p-0 hover:bg-primary/10 disabled:opacity-50"
            title="Zoom out (Alt + Z)"
            aria-label="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>

          {/* Zoom Level Display */}
          <div className="px-3 py-1 text-sm font-medium text-muted-foreground min-w-[60px] text-center">
            {Math.round(zoomLevel * 100)}%
          </div>

          {/* Zoom In */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onZoomIn}
            disabled={zoomLevel >= 4}
            className="h-9 w-9 p-0 hover:bg-primary/10 disabled:opacity-50"
            title="Zoom in (Z)"
            aria-label="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>

          {/* Separator */}
          <div className="w-px h-6 bg-border mx-1" />

          {/* Zoom Mode Toggle */}
          <Button
            variant={isZoomMode ? "default" : "ghost"}
            size="sm"
            onClick={onToggleZoomMode}
            className={`h-9 w-9 p-0 ${isZoomMode
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "hover:bg-primary/10"
              }`}
            title="Toggle zoom mode (Z)"
            aria-label={isZoomMode ? "Disable zoom mode" : "Enable zoom mode"}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>

          {/* Pan Mode Toggle */}
          <Button
            variant={isPanMode ? "default" : "ghost"}
            size="sm"
            onClick={onTogglePanMode}
            className={`h-9 w-9 p-0 ${isPanMode
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "hover:bg-primary/10"
              }`}
            title="Toggle pan mode (Space)"
            aria-label={isPanMode ? "Disable pan mode" : "Enable pan mode"}
          >
            <Move className="h-4 w-4" />
          </Button>

          {/* Separator */}
          <div className="w-px h-6 bg-border mx-1" />

          {/* Fit to Screen */}
          {onFitToScreen && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onFitToScreen}
              className="h-9 w-9 p-0 hover:bg-primary/10"
              title="Fit to screen"
              aria-label="Fit image to screen"
            >
              <Maximize className="h-4 w-4" />
            </Button>
          )}

          {/* Reset View */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetView}
            className="h-9 w-9 p-0 hover:bg-primary/10"
            title="Reset view"
            aria-label="Reset view"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}