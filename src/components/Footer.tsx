
import React from 'react';
import { CheckCircle, AlertCircle, Info, Zap, Loader2 } from 'lucide-react';

interface FooterProps {
    error: string | null;
    isProcessing: boolean;
    processingStatus: string;
    originalImage: HTMLImageElement | null;
    previewImage: HTMLImageElement | ImageBitmap | null;
    zoomLevel: number;
    statusMessage: string;
}

export function Footer({
    error,
    isProcessing,
    processingStatus,
    originalImage,
    previewImage,
    zoomLevel,
    statusMessage,
}: FooterProps) {

    const getStatusIcon = () => {
        if (error) return <AlertCircle className="w-4 h-4 text-destructive animate-bounce-subtle" />;
        if (isProcessing) return <Loader2 className="w-4 h-4 animate-spin text-primary" />;
        if (processingStatus.includes('complete') || processingStatus.includes('ready')) {
            return <CheckCircle className="w-4 h-4 text-green-600 animate-pulse-slow" />;
        }
        if (processingStatus.includes('zoom') || processingStatus.includes('rendering')) {
            return <Zap className="w-4 h-4 text-primary animate-pulse" />;
        }
        return <Info className="w-4 h-4 text-muted-foreground" />;
    };

    return (
        <div className="flex-shrink-0 border-t border-border surface-container-high hover:bg-surface-container-highest transition-colors h-10 flex items-center justify-between px-4 text-xs gap-4 relative z-20 overflow-hidden">
            {/* Left: Branding */}
            <div className="flex items-center gap-3 justify-self-start min-w-0 overflow-hidden">
                <span className="font-semibold text-foreground tracking-tight whitespace-nowrap">Posterama</span>
                <span className="text-border">|</span>
                <span className="text-muted-foreground whitespace-nowrap truncate">
                    Designed by{' '}
                    <a
                        href="https://nebojsa.design"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                    >
                        nebojsa.design
                    </a>
                </span>
            </div>

            {/* Center: Status Pill */}
            <div className="justify-self-center flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container elevation-1 border border-border/50 max-w-full overflow-hidden">
                <div className="flex-shrink-0">
                    {getStatusIcon()}
                </div>
                <span className={`transition - all duration - 200 truncate ${error ? 'text-destructive font-medium' :
                    (isProcessing || processingStatus) ? 'text-primary font-medium' : 'text-muted-foreground'
                    } `}>
                    {error || processingStatus || (isProcessing ? 'Processing...' : statusMessage)}
                </span>
            </div>

            {/* Right: Image Stats */}
            <div className="flex items-center gap-3 text-muted-foreground font-mono justify-self-end min-w-0">
                {originalImage && (
                    <>
                        <div className="flex items-center gap-1.5 whitespace-nowrap" title="Original Image Dimensions">
                            <span className="text-xs text-muted-foreground/70">Orig:</span>
                            <span>{originalImage.width} × {originalImage.height}</span>
                        </div>
                        {previewImage && previewImage.width !== originalImage.width && (
                            <>
                                <span className="text-border">|</span>
                                <div className="flex items-center gap-1.5 whitespace-nowrap" title="Current Canvas Resolution">
                                    <span className="text-xs text-primary font-semibold">Canvas:</span>
                                    <span className="text-primary font-semibold">{previewImage.width} × {previewImage.height}</span>
                                </div>
                            </>
                        )}
                        <span className="text-border">|</span>
                        <div className="flex items-center gap-1.5 whitespace-nowrap" title="Zoom Level">
                            <span>{Math.round(zoomLevel * 100)}%</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
