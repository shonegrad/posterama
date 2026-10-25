import { useState, useEffect } from 'react';
import { Upload, Image } from 'lucide-react';
import { Button } from './ui/button';
import { START_SCREEN_IMAGES } from '../lib/constants';

interface SkeletonPreviewAreaProps {
  onBrowseClick: () => void;
  isDragOver?: boolean;
}

export function SkeletonPreviewArea({ onBrowseClick, isDragOver = false }: SkeletonPreviewAreaProps) {
  const [backgroundImage, setBackgroundImage] = useState<string>('');

  useEffect(() => {
    // Select a random image on mount
    const randomIndex = Math.floor(Math.random() * START_SCREEN_IMAGES.length);
    setBackgroundImage(START_SCREEN_IMAGES[randomIndex]);
  }, []);

  return (
    <div className={`h-full flex items-center justify-center surface-container-low relative overflow-hidden transition-all duration-300 ${isDragOver
      ? 'bg-primary/5'
      : ''
      }`}>

      {/* Dynamic Background Image with 30% Opacity */}
      {backgroundImage && (
        <div
          className="absolute inset-0 z-0 opacity-30 transition-opacity duration-1000"
          style={{
            backgroundImage: `url("${backgroundImage}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      {/* M3 Elevated Card */}
      <div className={`
        relative z-10 w-full max-w-sm mx-4
        rounded-xl overflow-hidden
        surface-container elevation-1
        transition-all duration-200 ease-out
        ${isDragOver
          ? 'elevation-3 scale-[1.02] ring-2 ring-primary ring-offset-2 ring-offset-background'
          : 'hover:elevation-2'
        }
      `}>
        {/* State Layer */}
        <div className={`absolute inset-0 transition-opacity duration-200 pointer-events-none ${isDragOver
          ? 'bg-primary/12'
          : 'bg-transparent hover:bg-on-surface/4'
          }`}
        />

        {/* Card Content */}
        <div className="relative p-6">
          {/* Icon Container - M3 uses tonal containers */}
          <div className="w-16 h-16 mx-auto mb-5 rounded-full surface-container-highest flex items-center justify-center">
            <Image className="w-8 h-8 text-primary" />
          </div>

          {/* Headline - M3 Title Large */}
          <h3 className="text-xl font-medium text-foreground text-center mb-2 tracking-normal">
            Posterama
          </h3>

          {/* Supporting Text - M3 Body Medium */}
          <p className="text-sm text-muted-foreground text-center leading-relaxed mb-6">
            Create stunning poster art with dithering and patterns
          </p>

          {/* Primary Action - M3 Filled Button */}
          <div className="flex justify-center mb-4">
            <Button
              onClick={onBrowseClick}
              className="h-10 px-6 rounded-full font-medium"
              size="default"
            >
              <Upload className="w-[18px] h-[18px] mr-2" />
              Upload Image
            </Button>
          </div>

          {/* Helper Text - M3 Body Small */}
          <div className={`text-xs text-center space-y-1 transition-colors duration-200 ${isDragOver
            ? 'text-primary font-medium'
            : 'text-muted-foreground'
            }`}>
            <p>{isDragOver ? 'Drop file now!' : 'Drag & drop or paste from clipboard'}</p>
            <p className="text-muted-foreground/60">JPEG, PNG, WebP supported</p>
          </div>
        </div>
      </div>
    </div>
  );
}