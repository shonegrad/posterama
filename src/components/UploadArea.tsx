import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Upload, MousePointer2, Copy, Loader2, AlertCircle } from 'lucide-react';

interface UploadAreaProps {
  dropZoneRef: React.RefObject<HTMLDivElement>;
  isDragOver: boolean;
  isProcessing: boolean;
  processingStatus: string;
  error: string | null;
  onBrowseClick: () => void;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

export function UploadArea({
  dropZoneRef,
  isDragOver,
  isProcessing,
  processingStatus,
  error,
  onBrowseClick,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop
}: UploadAreaProps) {
  return (
    <div className="flex-1 flex items-center justify-center" style={{ minHeight: '600px' }}>
      <div 
        ref={dropZoneRef}
        className={`
          w-full h-full rounded-lg overflow-hidden bg-muted/10 flex items-center justify-center shadow-inner transition-all duration-200
          ${isDragOver 
            ? 'border-4 border-dashed border-primary bg-primary/5' 
            : 'border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/20'
          }
          ${isProcessing ? 'pointer-events-none opacity-50' : ''}
        `}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <div className="text-center text-muted-foreground p-8">
          {isProcessing ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <span>{processingStatus || 'Processing...'}</span>
            </div>
          ) : isDragOver ? (
            <div className="text-primary animate-bounce">
              <MousePointer2 className="w-12 h-12 mx-auto mb-4" />
              <p>Drop your image here</p>
            </div>
          ) : (
            <>
              <Upload className="w-12 h-12 mx-auto mb-4" />
              <p className="mb-4">Upload an image to begin</p>
              <Button
                onClick={onBrowseClick}
                className="mb-4"
                disabled={isProcessing}
              >
                Browse Files
              </Button>
              <span className="text-xs text-muted-foreground">or drag and drop</span>
              <p className="text-xs mt-4 text-muted-foreground max-w-sm mx-auto">
                Supports JPEG, PNG, WebP and other common image formats. Max size: 25MB
              </p>
            </>
          )}
        </div>
        
        {/* Error Display inside upload area */}
        {error && (
          <div className="absolute bottom-4 left-4 right-4">
            <Alert className="border-destructive/20 bg-destructive/5">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive">
                {error}
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </div>
  );
}