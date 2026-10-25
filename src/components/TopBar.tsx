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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from './ui/alert-dialog';
import { Upload, Download, Loader2, X, ChevronDown, Moon, Sun, Save, Trash2, FolderOpen, Pencil, FileUp, FileDown } from 'lucide-react';
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
    onRenamePreset: (id: string, newName: string) => void;
    onDeleteAllPresets: () => void;
    /** Parses a JSON file's text and imports valid presets; returns count added */
    onImportPresets: (jsonText: string) => number;
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
    onRenamePreset,
    onDeleteAllPresets,
    onImportPresets,
    hasPresetWithName,
}: TopBarProps) {
    const [isSavePresetDialogOpen, setIsSavePresetDialogOpen] = React.useState(false);
    const [renamingPreset, setRenamingPreset] = React.useState<UserPreset | null>(null);
    const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = React.useState(false);
    const presetsImportInputRef = React.useRef<HTMLInputElement>(null);

    // Duplicate-name check for renames: keeping the preset's own current name is fine
    const isRenameNameTaken = (newName: string): boolean => {
        if (!renamingPreset) return false;
        const self = userPresets.find(p => p.id === renamingPreset.id);
        if (self && self.name.toLowerCase() === newName.trim().toLowerCase()) return false;
        return hasPresetWithName(newName);
    };

    const handleExportPresets = () => {
        const blob = new Blob([JSON.stringify(userPresets, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('download', `posterama-presets-${new Date().toISOString().slice(0, 10)}.json`);
        link.href = url;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);
    };

    const handleImportFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        try {
            const text = await file.text();
            onImportPresets(text);
        } catch {
            // unreadable file - ignore, onImportPresets will never be a partial import
        }
    };

    return (
        <div className="flex-shrink-0 border-b border-border surface-container-high hover:bg-surface-container-highest transition-colors h-12 flex items-center px-4 justify-end gap-2">
            <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                    handleImageUpload(e);
                }}
                ref={fileInputRef}
                className="hidden"
                disabled={isProcessing}
            />
            {/* Import presets file input */}
            <input
                type="file"
                accept="application/json,.json"
                onChange={handleImportFileChange}
                ref={presetsImportInputRef}
                className="hidden"
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
                                    <span className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-5 w-5 p-0 hover:bg-primary/10"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setRenamingPreset(preset);
                                            }}
                                            title={`Rename ${preset.name}`}
                                            aria-label={`Rename ${preset.name}`}
                                        >
                                            <Pencil className="w-3 h-3" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-5 w-5 p-0 hover:bg-destructive/10 hover:text-destructive"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeletePreset(preset.id);
                                            }}
                                            title={`Delete ${preset.name}`}
                                            aria-label={`Delete ${preset.name}`}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </span>
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

                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => presetsImportInputRef.current?.click()}>
                        <FileUp className="w-4 h-4 mr-2" />
                        Import JSON...
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={handleExportPresets}
                        disabled={userPresets.length === 0}
                    >
                        <FileDown className="w-4 h-4 mr-2" />
                        Export JSON
                    </DropdownMenuItem>
                    {userPresets.length > 0 && (
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setIsDeleteAllDialogOpen(true)}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete All...
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <SavePresetDialog
                isOpen={isSavePresetDialogOpen}
                onClose={() => setIsSavePresetDialogOpen(false)}
                onSave={onSavePreset}
                hasPresetWithName={hasPresetWithName}
            />

            <SavePresetDialog
                isOpen={!!renamingPreset}
                onClose={() => setRenamingPreset(null)}
                mode="rename"
                initialName={renamingPreset?.name ?? ''}
                onSave={(newName) => {
                    if (renamingPreset) {
                        onRenamePreset(renamingPreset.id, newName);
                    }
                }}
                hasPresetWithName={isRenameNameTaken}
            />

            <AlertDialog open={isDeleteAllDialogOpen} onOpenChange={setIsDeleteAllDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete all presets?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This permanently removes all {userPresets.length} saved
                            preset{userPresets.length === 1 ? '' : 's'} from this browser. This
                            cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-white hover:bg-destructive/90"
                            onClick={() => {
                                onDeleteAllPresets();
                                setIsDeleteAllDialogOpen(false);
                            }}
                        >
                            Delete All
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

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
