import React from 'react';
import { Button } from './ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Upload, Download, Loader2, X, ChevronDown, Moon, Sun, Save, Trash2, FolderOpen } from 'lucide-react';
import { ExportDialog, ExportOptions } from './ExportDialog';
import { SavePresetDialog } from './SavePresetDialog';
import { UserPreset } from '../hooks/useUserPresets';

interface TopBarProps {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    handleBrowseClick: () => void;
    handleClearImage: () => void;
    isProcessing: boolean;
    originalImage: HTMLImageElement | null;
    originalFileName: string;
    downloadImage: () => void;
    exportImage: (options: ExportOptions) => Promise<void>;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isExportDialogOpen: boolean;
    setIsExportDialogOpen: (isOpen: boolean) => void;
    generateSmartFilename: () => string;
    // Preset props
    userPresets: UserPreset[];
    onSavePreset: (name: string) => void;
    onLoadPreset: (id: string) => void;
    onDeletePreset: (id: string) => void;
    hasPresetWithName: (name: string) => boolean;
}

export function TopBar({
    isDarkMode,
    toggleDarkMode,
    handleBrowseClick,
    handleClearImage,
    isProcessing,
    originalImage,
    originalFileName,
    downloadImage,
    exportImage,
    fileInputRef,
    handleImageUpload,
    isExportDialogOpen,
    setIsExportDialogOpen,
    generateSmartFilename,
    userPresets,
    onSavePreset,
    onLoadPreset,
    onDeletePreset,
    hasPresetWithName,
}: TopBarProps) {
    const [isSavePresetDialogOpen, setIsSavePresetDialogOpen] = React.useState(false);
    return (
        <div className="flex-shrink-0 border-b border-border surface-container-high hover:bg-surface-container-highest transition-colors h-12 flex items-center px-4 justify-end gap-2">
            <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                    console.log('File input changed', e.target.files);
                    handleImageUpload(e);
                }}
                ref={fileInputRef}
                className="hidden"
                disabled={isProcessing}
            />
            {/* Dark Mode Toggle */}
            <Button
                onClick={toggleDarkMode}
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-surface-container-high hover:bg-surface-container-highest transition-colors"
                title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            <div className="h-4 w-px bg-border mx-1" />

            {/* Presets Dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-sm gap-1 hover:bg-surface-container-high hover:bg-surface-container-highest transition-colors px-3"
                    >
                        <FolderOpen className="w-3 h-3" />
                        <span className="hidden sm:inline">Presets</span>
                        <ChevronDown className="h-2.5 w-2.5 opacity-70" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => setIsSavePresetDialogOpen(true)}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Current
                    </DropdownMenuItem>
                    {userPresets.length > 0 && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Your Presets</DropdownMenuLabel>
                            {userPresets.map((preset) => (
                                <DropdownMenuItem
                                    key={preset.id}
                                    className="flex items-center justify-between group"
                                    onClick={() => onLoadPreset(preset.id)}
                                >
                                    <span className="truncate">{preset.name}</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeletePreset(preset.id);
                                        }}
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                </DropdownMenuItem>
                            ))}
                        </>
                    )}
                    {userPresets.length === 0 && (
                        <>
                            <DropdownMenuSeparator />
                            <div className="px-2 py-2 text-sm text-muted-foreground text-center">
                                No presets saved yet
                            </div>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <SavePresetDialog
                isOpen={isSavePresetDialogOpen}
                onClose={() => setIsSavePresetDialogOpen(false)}
                onSave={onSavePreset}
                hasPresetWithName={hasPresetWithName}
            />

            <div className="h-4 w-px bg-border mx-1" />

            <Button
                onClick={handleBrowseClick}
                variant="ghost"
                size="sm"
                className="h-7 text-sm gap-1 hover:bg-surface-container-high hover:bg-surface-container-highest transition-colors px-3"
                disabled={isProcessing}
            >
                <Upload className="w-3 h-3" />
                <span className="hidden sm:inline">Browse</span>
            </Button>

            {originalImage && (
                <>
                    <Button
                        onClick={handleClearImage}
                        variant="ghost"
                        size="sm"
                        className="h-7 text-sm gap-1 hover:bg-surface-container-high hover:bg-surface-container-highest transition-colors hover:text-destructive px-3"
                        disabled={isProcessing}
                    >
                        <X className="w-3 h-3" />
                        <span className="hidden sm:inline">Clear</span>
                    </Button>

                    <span className="text-xs text-muted-foreground font-mono select-all mr-2">
                        {generateSmartFilename()}.png
                    </span>

                    {/* Export Dropdown Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="default"
                                size="sm"
                                disabled={!originalImage || isProcessing}
                                className="h-7 gap-1 relative overflow-hidden group shadow-md shadow-primary/20 min-w-[80px] text-sm font-medium px-3"
                            >
                                {isProcessing ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                    <Download className="h-3 w-3" />
                                )}
                                <span className="relative z-10">Export</span>
                                <ChevronDown className="h-2.5 w-2.5 ml-0.5 opacity-70" />

                                {/* Shine effect */}
                                <span className="absolute inset-0 translate-x-[-100%] group-hover:animate-shine bg-gradient-to-r from-transparent via-white/20 to-transparent z-0" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Quick Export</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => downloadImage && downloadImage()}>
                                <div className="flex flex-col gap-0.5">
                                    <span className="font-medium">Original (High Res)</span>
                                    <span className="text-sm text-muted-foreground">Full resolution processed image</span>
                                </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => exportImage({
                                format: 'png',
                                quality: 0.9,
                                scale: 0.5,
                                filename: originalFileName
                            })}>
                                <div className="flex flex-col gap-0.5">
                                    <span className="font-medium">Preview (Lo-Res)</span>
                                    <span className="text-sm text-muted-foreground">50% scale, optimized for sharing</span>
                                </div>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setIsExportDialogOpen(true)}>
                                <div className="flex items-center gap-2">
                                    <span>Advanced Options...</span>
                                </div>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="h-6 w-px bg-border mx-2" />

                    <ExportDialog
                        isOpen={isExportDialogOpen}
                        onClose={() => setIsExportDialogOpen(false)}
                        onExport={exportImage}
                        originalFilename={originalFileName}
                        isProcessing={isProcessing}
                        imageDimensions={originalImage ? { width: originalImage.width, height: originalImage.height } : { width: 0, height: 0 }}
                    />
                </>
            )}
        </div>
    );
}
