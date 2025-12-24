import { Upload, Image } from 'lucide-react';
import { Button } from './ui/button';

interface SkeletonPreviewAreaProps {
  onBrowseClick: () => void;
  isDragOver?: boolean;
}

export function SkeletonPreviewArea({ onBrowseClick, isDragOver = false }: SkeletonPreviewAreaProps) {
  return (
    <div className={`h-full flex items-center justify-center surface-container-low rounded border-2 border-dashed relative overflow-hidden transition-all duration-300 ${isDragOver
      ? 'border-primary bg-primary/5 scale-105 shadow-xl shadow-primary/20'
      : 'border-border hover:border-primary/50 hover:scale-[1.01] hover:shadow-2xl hover:shadow-primary/10'
      }`}>
      {/* Background grid pattern */}
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2672&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] z-0" />

      <div className="text-center max-w-md mx-auto p-8 relative z-10">
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto mb-4 surface-container-high rounded flex items-center justify-center elevation-1">
            <Image className="w-12 h-12 text-muted-foreground opacity-50" />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">
            Posterama
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Upload an image to get started. Supports JPEG, PNG, WebP, and other common image formats.
            You can drag and drop files or paste images from your clipboard.
          </p>

          <div className="pt-2">
            <Button
              onClick={onBrowseClick}
              className="elevation-2"
              size="lg"
            >
              <Upload className="w-4 h-4 mr-2" />
              Browse Images
            </Button>
          </div>

          <div className={`text-xs space-y-1 transition-colors duration-200 ${isDragOver ? 'text-primary' : 'text-muted-foreground'
            }`}>
            <p>{isDragOver ? 'Drop your image here!' : 'Or drag and drop an image anywhere'}</p>
            <p>Keyboard shortcuts: Paste (Ctrl+V), Upload (Ctrl+O)</p>
          </div>
        </div>
      </div>
    </div>
  );
}