import { Button } from './ui/button';
import { Label } from './ui/label';
import { Skeleton } from './ui/skeleton';
import { Palette } from 'lucide-react';

export function SkeletonControlsPanel() {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-base font-medium">Algorithm Settings</h4>
      </div>
      
      <div className="rounded transition-all duration-200 elevation-2 border border-border surface-container">
        <div className="p-3">
          <div className="space-y-3">
            {/* Algorithm Selection */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Algorithm</Label>
              <div className="grid grid-cols-3 gap-1">
                {Array.from({ length: 9 }).map((_, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs elevation-1 border-0 surface-container-high opacity-50 cursor-not-allowed"
                    disabled
                  >
                    <Skeleton className="h-3 w-12" />
                  </Button>
                ))}
              </div>
              <Skeleton className="h-3 w-full" />
            </div>

            {/* Color Presets */}
            <div className="space-y-2">
              <Label className="text-xs font-medium flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Color Presets
              </Label>
              
              <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: 8 }).map((_, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs elevation-1 border-0 surface-container-high opacity-50 cursor-not-allowed justify-start"
                    disabled
                  >
                    <div className="flex items-center gap-2 w-full">
                      <div className="flex gap-1">
                        {Array.from({ length: 3 }).map((_, dotIndex) => (
                          <Skeleton key={dotIndex} className="w-2 h-2 rounded-full" />
                        ))}
                      </div>
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Extracted Colors placeholder */}
            <div className="space-y-2 opacity-50">
              <Label className="text-xs font-medium">Extracted Colors</Label>
              <div className="flex gap-1 flex-wrap">
                {Array.from({ length: 8 }).map((_, index) => (
                  <Skeleton key={index} className="w-5 h-5 rounded" />
                ))}
              </div>
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}