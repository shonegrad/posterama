import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Slider } from './ui/slider';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './ui/select';
import { Download, Loader2 } from 'lucide-react';

export interface ExportOptions {
    format: 'png' | 'jpeg' | 'webp';
    quality: number;
    scale: number;
    filename: string;
}

interface ExportDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onExport: (options: ExportOptions) => Promise<void>;
    originalFilename: string;
    isProcessing: boolean;
    imageDimensions: { width: number; height: number };
}

export function ExportDialog({
    isOpen,
    onClose,
    onExport,
    originalFilename,
    isProcessing,
    imageDimensions
}: ExportDialogProps) {
    const [format, setFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
    const [quality, setQuality] = useState<number>(90);
    const [scale, setScale] = useState<string>('1');
    const [customScale, setCustomScale] = useState<number>(1);
    const [filename, setFilename] = useState<string>('');

    // Initialize filename when dialog opens
    useEffect(() => {
        if (isOpen) {
            const nameWithoutExt = originalFilename.split('.').slice(0, -1).join('.') || 'image';
            setFilename(nameWithoutExt);
        }
    }, [isOpen, originalFilename]);

    const handleExport = async () => {
        const finalScale = scale === 'custom' ? customScale : parseFloat(scale);

        await onExport({
            format,
            quality: quality / 100,
            scale: finalScale,
            filename: filename || 'image'
        });

        if (!isProcessing) {
            onClose();
        }
    };

    const getEstimatedFileSize = () => {
        // Very rough estimation
        const finalScale = scale === 'custom' ? customScale : parseFloat(scale);
        const width = imageDimensions.width * finalScale;
        const height = imageDimensions.height * finalScale;
        const pixels = width * height;

        let bytesPerPixel = 4; // PNG raw
        if (format === 'jpeg') bytesPerPixel = 0.5 + ((quality / 100) * 1.5); // Compression estimate
        if (format === 'webp') bytesPerPixel = 0.3 + ((quality / 100) * 1.2); // Better compression

        const sizeBytes = pixels * bytesPerPixel;
        const sizeMB = sizeBytes / (1024 * 1024);

        return sizeMB < 1 ? `${(sizeMB * 1024).toFixed(0)} KB` : `${sizeMB.toFixed(1)} MB`;
    };

    const getOutputDimensions = () => {
        const finalScale = scale === 'custom' ? customScale : parseFloat(scale);
        const width = Math.round(imageDimensions.width * finalScale);
        const height = Math.round(imageDimensions.height * finalScale);
        return `${width} x ${height} px`;
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !isProcessing && !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Export Image</DialogTitle>
                    <DialogDescription>
                        Configure export settings for your processed image.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Filename */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="filename" className="text-right text-sm">
                            Name
                        </Label>
                        <Input
                            id="filename"
                            value={filename}
                            onChange={(e) => setFilename(e.target.value)}
                            className="col-span-3 h-8 text-sm"
                        />
                    </div>

                    {/* Format */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="format" className="text-right text-sm">
                            Format
                        </Label>
                        <Select value={format} onValueChange={(v: any) => setFormat(v)}>
                            <SelectTrigger className="col-span-3 h-8 text-sm">
                                <SelectValue placeholder="Select format" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="png">PNG (Lossless)</SelectItem>
                                <SelectItem value="jpeg">JPEG (Web)</SelectItem>
                                <SelectItem value="webp">WebP (Modern)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Quality (only for lossy formats) */}
                    {(format === 'jpeg' || format === 'webp') && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="quality" className="text-right text-sm">
                                Quality
                            </Label>
                            <div className="col-span-3 flex items-center gap-4">
                                <Slider
                                    id="quality"
                                    min={1}
                                    max={100}
                                    step={1}
                                    value={[quality]}
                                    onValueChange={(vals) => setQuality(vals[0])}
                                    className="flex-1"
                                />
                                <span className="w-8 text-sm text-right font-mono">{quality}%</span>
                            </div>
                        </div>
                    )}

                    {/* Scale */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="scale" className="text-right text-sm">
                            Scale
                        </Label>
                        <Select value={scale} onValueChange={setScale}>
                            <SelectTrigger className="col-span-3 h-8 text-sm">
                                <SelectValue placeholder="Select scale" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0.5">0.5x (Half)</SelectItem>
                                <SelectItem value="1">1x (Original)</SelectItem>
                                <SelectItem value="2">2x (Double)</SelectItem>
                                <SelectItem value="3">3x (Triple)</SelectItem>
                                <SelectItem value="4">4x (Quadruple)</SelectItem>
                                <SelectItem value="custom">Custom...</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Custom Scale Input */}
                    {scale === 'custom' && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="customScale" className="text-right text-sm">
                                Multiplier
                            </Label>
                            <div className="col-span-3 flex items-center gap-2">
                                <Input
                                    id="customScale"
                                    type="number"
                                    min="0.1"
                                    max="10"
                                    step="0.1"
                                    value={customScale}
                                    onChange={(e) => setCustomScale(parseFloat(e.target.value))}
                                    className="flex-1 h-8 text-sm"
                                />
                                <span className="text-sm text-muted-foreground w-8">x</span>
                            </div>
                        </div>
                    )}

                    {/* Info Summary */}
                    <div className="mt-2 rounded-md bg-muted p-3 text-sm text-muted-foreground">
                        <div className="flex justify-between">
                            <span>Dimensions:</span>
                            <span className="font-medium text-foreground">{getOutputDimensions()}</span>
                        </div>
                        <div className="flex justify-between mt-1">
                            <span>Est. Size:</span>
                            <span className="font-medium text-foreground">{getEstimatedFileSize()}</span>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isProcessing}>
                        Cancel
                    </Button>
                    <Button onClick={handleExport} disabled={isProcessing} className="gap-2">
                        {isProcessing ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Download className="h-4 w-4" />
                                Export
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
