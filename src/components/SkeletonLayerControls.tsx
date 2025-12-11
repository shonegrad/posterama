import { Button } from './ui/button';
import { Label } from './ui/label';
import { Skeleton } from './ui/skeleton';
import { RotateCcw, Eye, ChevronDown } from 'lucide-react';

export function SkeletonLayerControls() {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-base font-medium">Layer Settings</h4>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 elevation-1 border-0 surface-container-high opacity-50 cursor-not-allowed"
            disabled
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 elevation-1 border-0 surface-container-high opacity-50 cursor-not-allowed"
            disabled
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Layer Controls */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => {
          const layerName = index === 3 ? 'Background' : `Layer ${index + 1}`;
          
          return (
            <div 
              key={index} 
              className="rounded elevation-2 border border-border surface-container opacity-50"
            >
              {/* Layer Header */}
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-6 w-6 cursor-not-allowed"
                    disabled
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                  
                  <Label className="flex items-center gap-2 text-xs font-medium">
                    {layerName}
                  </Label>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-6 w-6 cursor-not-allowed"
                    disabled
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded" />
                  {index !== 3 && (
                    <Skeleton className="w-8 h-4" />
                  )}
                </div>
              </div>
              
              {/* Layer Content */}
              <div className="space-y-3 p-3 pt-0">
                {/* Threshold - Hidden for background layer */}
                {index !== 3 && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs font-medium">Threshold</Label>
                      <Skeleton className="w-8 h-3" />
                    </div>
                    <Skeleton className="w-full h-5" />
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-medium">Opacity</Label>
                    <Skeleton className="w-8 h-3" />
                  </div>
                  <Skeleton className="w-full h-5" />
                </div>

                {/* Blend Mode */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Blend Mode</Label>
                  <Skeleton className="w-full h-8 rounded-md" />
                </div>

                {/* Pattern */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Pattern</Label>
                  <Skeleton className="w-full h-8 rounded-md" />
                </div>

                {/* Pattern Controls placeholder */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-medium">Pattern Size</Label>
                    <Skeleton className="w-8 h-3" />
                  </div>
                  <Skeleton className="w-full h-5" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-medium">Pattern Rotation</Label>
                    <Skeleton className="w-8 h-3" />
                  </div>
                  <Skeleton className="w-full h-5" />
                </div>

                {/* Pattern Colors */}
                <div className="space-y-2 p-3 surface-container-high rounded">
                  <Label className="text-xs font-medium">Pattern Colors</Label>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-6 h-6 rounded" />
                      <Label className="text-xs">Fg</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-6 h-6 rounded" />
                      <Label className="text-xs">Bg</Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Export info */}
      <div className="mt-4 pt-4 border-t border-border opacity-50">
        <Skeleton className="h-3 w-32 mx-auto" />
        <Skeleton className="h-3 w-40 mx-auto mt-1" />
      </div>
    </div>
  );
}