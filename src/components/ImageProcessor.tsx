import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Card } from './ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Loader2 } from 'lucide-react';

// Import components and hooks
import { LayerControls } from './LayerControls';
import { ControlsPanel } from './ControlsPanel';
import { ExportDialog, ExportOptions } from './ExportDialog';
import { PreviewArea } from './PreviewArea';
import { UploadArea } from './UploadArea';
import { SkeletonControlsPanel } from './SkeletonControlsPanel';
import { SkeletonLayerControls } from './SkeletonLayerControls';
import { SkeletonPreviewArea } from './SkeletonPreviewArea';
import { TopBar } from './TopBar';
import { Footer } from './Footer';

import { useImageProcessor } from '../hooks/useImageProcessor';

// Import constants
import { LayerConfig, COLOR_PRESETS, DEFAULT_LAYERS, ZOOM_MIN, ZOOM_MAX } from '../lib/constants';

export function ImageProcessor() {
  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    // Check localStorage for saved preference
    const saved = localStorage.getItem('darkMode');
    // Default to true (dark mode) if no preference saved
    return saved ? JSON.parse(saved) : true;
  });

  // Effect to handle dark mode class on document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const {
    originalImage,
    previewImage,
    originalFileName,
    isOptimized,
    colorPalette,
    selectedLayer,
    layers,
    algorithm,
    isProcessing,
    processingStatus,
    error,
    showPreview,
    canvasRef,
    fileInputRef,
    dropZoneRef,
    setSelectedLayer,
    setLayers,
    setAlgorithm,
    setShowPreview,
    setError,
    updateStatus,
    processImageFile,
    processImageOnCanvas,
    downloadImage, // Legacy compatible
    exportImage,

    clearImage,
    undo,
    redo,
    canUndo,
    canRedo,
    addLayer,
    deleteLayer,

  } = useImageProcessor();

  // Export dialog state
  const [isExportDialogOpen, setIsExportDialogOpen] = useState<boolean>(false);

  // View state
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [isZoomMode, setIsZoomMode] = useState<boolean>(false);
  const [isPanMode, setIsPanMode] = useState<boolean>(true); // Default to Hand Tool
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const [lastMousePos, setLastMousePos] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);

  // Track previous tool state for spring-loaded shortcuts (Spacebar)
  const previousToolRef = useRef<{ isZoom: boolean; isPan: boolean } | null>(null);

  // Refs for preventing infinite loops
  // Refs for preventing infinite loops and measuring container
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastProcessingParamsRef = useRef<string>('');
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Calculate zoom to fit image within container
  const calculateFitZoom = useCallback((imgWidth: number, imgHeight: number) => {
    if (!previewContainerRef.current || imgWidth <= 0 || imgHeight <= 0) return 1;

    const container = previewContainerRef.current;
    const padding = 32; // 2rem padding
    const availableWidth = Math.max(0, container.clientWidth - padding);
    const availableHeight = Math.max(0, container.clientHeight - padding);

    if (availableWidth === 0 || availableHeight === 0) return 1;

    const wScale = availableWidth / imgWidth;
    const hScale = availableHeight / imgHeight;

    // For horizontal images (wider), fit to width
    // For vertical images (taller), fit to height
    const isHorizontal = imgWidth > imgHeight;
    const fitScale = isHorizontal ? wScale : hScale;

    // Ensure result is Finite and within bounds
    return Math.max(ZOOM_MIN, Math.min(fitScale, ZOOM_MAX));
  }, []);

  // Zoom and pan functions

  const zoomIn = useCallback(() => {
    setZoomLevel(prev => {
      const newZoom = Math.min(prev * 1.5, ZOOM_MAX);
      updateStatus(`Zoom in to ${Math.round(newZoom * 100)}%`);
      return newZoom;
    });
  }, [updateStatus]);

  const zoomOut = useCallback(() => {
    setZoomLevel(prev => {
      const newZoom = Math.max(prev / 1.5, ZOOM_MIN);
      updateStatus(`Zoom out to ${Math.round(newZoom * 100)}%`);
      return newZoom;
    });
  }, [updateStatus]);

  const togglePanMode = useCallback(() => {
    setIsPanMode(prev => {
      const newPanMode = !prev;
      setIsZoomMode(false);
      updateStatus(newPanMode ? 'Pan mode active - drag to move' : 'Pan mode disabled');
      return newPanMode;
    });
  }, [updateStatus]);

  const toggleZoomMode = useCallback(() => {
    setIsZoomMode(prev => {
      const newZoomMode = !prev;
      setIsPanMode(false);
      updateStatus(newZoomMode ? 'Zoom mode active - click to zoom in' : 'Zoom mode disabled');
      return newZoomMode;
    });
  }, [updateStatus]);

  const fitToScreen = useCallback(() => {
    if (!originalImage || !canvasRef.current) return;

    // Use canvas CSS dimensions (not pixel dimensions)
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const canvasWidth = canvasRect.width || originalImage.width;
    const canvasHeight = canvasRect.height || originalImage.height;

    const newZoom = calculateFitZoom(canvasWidth, canvasHeight);
    setZoomLevel(newZoom);
    setPanOffset({ x: 0, y: 0 });
    updateStatus('Fit to screen');
  }, [originalImage, updateStatus, calculateFitZoom]);

  const lastFitImageRef = useRef<HTMLImageElement | null>(null);

  // Auto-fit when new image loads - DISABLED for 100% initial zoom
  // useEffect(() => {
  //   if (originalImage && originalImage !== lastFitImageRef.current) {
  //     lastFitImageRef.current = originalImage;
  //     // Small timeout to ensure container is laid out
  //     setTimeout(() => {
  //       fitToScreen();
  //     }, 50);
  //   }
  // }, [originalImage, fitToScreen]);

  // TODO: Remove this in production - Auto-load test image for development
  useEffect(() => {
    // Only load test image if no image is currently loaded
    if (!originalImage) {
      // Load the test image from public folder
      const img = new Image();
      img.onload = () => {
        // Convert to blob and load as file
        fetch('/test-image.jpg')
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], 'test-image.jpg', { type: 'image/jpeg' });
            processImageFile(file);
          })
          .catch(err => console.error('Error loading test image:', err));
      };
      img.src = '/test-image.jpg';
    }
  }, []); // Empty deps - only run once on mount

  // Clear image handler that also resets view state
  const handleClearImage = useCallback(() => {
    // Clear the image using the hook function
    clearImage();

    // Reset refs
    lastFitImageRef.current = null;

    // Reset view state
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setIsZoomMode(false);
    setIsPanMode(false);
    setIsPanning(false);
  }, [clearImage]);

  // Event handlers
  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  }, [processImageFile]);

  const handleBrowseClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [fileInputRef]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
    updateStatus('Drop image to upload');
  }, [updateStatus]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // For the skeleton state, we check if we're leaving the main container
    if (!originalImage) {
      const target = e.currentTarget as HTMLElement;
      const relatedTarget = e.relatedTarget as HTMLElement;
      if (!target.contains(relatedTarget)) {
        setIsDragOver(false);
        updateStatus('');
      }
    } else if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
      updateStatus('');
    }
  }, [dropZoneRef, updateStatus, originalImage]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));

    if (imageFile) {
      processImageFile(imageFile);
    } else if (files.length > 0) {
      setError('Please drop an image file (JPEG, PNG, WebP, etc.)');
    }
  }, [processImageFile, setError]);

  // Preview interaction handlers
  const handlePreviewMouseDown = useCallback((e: React.MouseEvent) => {
    // Only pan if we are in pan mode
    if (isPanMode) {
      setIsPanning(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  }, [isPanMode]);

  const handlePreviewMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      const deltaX = e.clientX - lastMousePos.x;
      const deltaY = e.clientY - lastMousePos.y;

      setPanOffset(prev => ({
        x: prev.x + deltaX / zoomLevel,
        y: prev.y + deltaY / zoomLevel
      }));

      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  }, [isPanning, lastMousePos, zoomLevel]);

  const handlePreviewMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    if (isZoomMode) {
      const rect = canvasRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;


      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const offsetX = (clickX - centerX) / zoomLevel;
      const offsetY = (clickY - centerY) / zoomLevel;

      // Exponential zoom
      const newZoomLevel = Math.min(zoomLevel * 1.5, ZOOM_MAX);

      setPanOffset(prev => ({
        x: prev.x - offsetX * (newZoomLevel - zoomLevel),
        y: prev.y - offsetY * (newZoomLevel - zoomLevel)
      }));

      setZoomLevel(newZoomLevel);
      setIsZoomMode(false);

      updateStatus(`Zoomed to ${Math.round(newZoomLevel * 100)}%`);
    }
  }, [canvasRef, isZoomMode, zoomLevel, updateStatus]);

  const resetView = useCallback(() => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setIsZoomMode(false);
    setIsPanMode(false);
    updateStatus('View reset');
  }, [updateStatus]);

  const handleZoomChange = useCallback((newZoom: number) => {
    setZoomLevel(newZoom);
    updateStatus(`Zoom: ${Math.round(newZoom * 100)}%`);
  }, [updateStatus]);

  const getCurrentCursor = () => {
    if (isZoomMode) return 'zoom-in';
    if (isPanning) return 'grabbing';
    // If not in zoom mode, we default to grab cursor to indicate panning is available
    return 'grab';
  };

  // Layer management functions
  const updateLayer = useCallback((index: number, field: keyof LayerConfig, value: number | string | boolean) => {
    setLayers(prevLayers => {
      const newLayers = [...prevLayers];
      newLayers[index] = { ...newLayers[index], [field]: value };
      return newLayers;
    });

    const layerName = index === layers.length - 1 ? 'Background' : `Layer ${index + 1} `;
    updateStatus(`Updated ${layerName} ${field} `);
  }, [setLayers, updateStatus]);

  const toggleLayerCollapse = (index: number) => {
    const newLayers = [...layers];
    newLayers[index] = { ...newLayers[index], collapsed: !newLayers[index].collapsed };
    setLayers(newLayers);

    if (newLayers[index].collapsed === false) {
      setSelectedLayer(index);
    }
  };

  const handleLayerColorClick = useCallback((index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedLayer(index);

    if (layers[index].collapsed) {
      const newLayers = [...layers];
      newLayers[index] = { ...newLayers[index], collapsed: false };
      setLayers(newLayers);
    }

    updateStatus(`Selected ${index === layers.length - 1 ? 'Background' : `Layer ${index + 1}`} `);
  }, [layers, setLayers, setSelectedLayer, updateStatus]);

  const applyPreset = useCallback((presetName: keyof typeof COLOR_PRESETS) => {
    // Clear any pending processing to prevent race conditions
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = null;
    }

    // Clear the processing params ref to ensure fresh processing
    lastProcessingParamsRef.current = '';

    // Apply layers - the useEffect will handle reprocessing automatically
    setLayers([...COLOR_PRESETS[presetName].layers]);
    setSelectedLayer(0);
    updateStatus(`Applied ${COLOR_PRESETS[presetName].name} color preset`);
  }, [updateStatus, setLayers, setSelectedLayer]);

  const resetLayers = useCallback(() => {
    // Clear any pending processing to prevent race conditions
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = null;
    }

    // Clear the processing params ref to ensure fresh processing
    lastProcessingParamsRef.current = '';

    // Apply layers - the useEffect will handle reprocessing automatically
    setLayers([...DEFAULT_LAYERS]);
    setSelectedLayer(0);
    updateStatus('Reset layers to default');
  }, [updateStatus, setLayers, setSelectedLayer]);

  const getLayerName = (index: number): string => {
    if (index === layers.length - 1) return 'Background';
    return `Layer ${index + 1} `;
  };

  const generateSmartFilename = () => {
    const timestamp = Date.now().toString().slice(-6);
    const algorithmShort = {
      'simple': 'simple',
      'floyd-steinberg': 'floyd',
      'ordered-dither': 'ordered',
      'atkinson': 'atkinson',
      'jarvis-judice-ninke': 'jarvis',
      'sierra': 'sierra',
      'burkes': 'burkes',
      'stucki': 'stucki',
      'riemersma': 'riemersma',
      'false-floyd-steinberg': 'false-floyd',
      'sierra-lite': 'sierra-lite'
    }[algorithm];

    const fileName = originalImage ? 'image' : 'image';
    return `${fileName} -${algorithmShort} -${timestamp} `;
  };



  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!originalImage) return;

      if (e.key === 'z' || e.key === ' ') {
        e.preventDefault();
      }

      if (e.key === 'z' && !e.repeat) {
        if (e.altKey || e.getModifierState('Alt') || e.getModifierState('AltGraph')) {
          e.preventDefault();
          zoomOut();
        } else {
          // Toggle Zoom Mode
          setIsZoomMode(prev => {
            const newState = !prev;
            setIsPanMode(!newState); // Toggle off Pan if Zoom is on, and vice versa
            updateStatus(newState ? 'Zoom mode active - click to zoom in' : 'Pan mode active');
            return newState;
          });
        }
      }

      if (e.key === ' ' && !e.repeat) {
        // Store current state if not already stored (to avoid overwriting on repeated strict calls if any)
        if (!previousToolRef.current) {
          previousToolRef.current = { isZoom: isZoomMode, isPan: isPanMode };
        }

        setIsPanMode(true);
        setIsZoomMode(false);
        updateStatus('Pan mode active - drag to move');
      }

      if (e.key === 'r' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        resetView();
      }

      if (e.key === 'R' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        resetLayers();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Z key is now a toggle in KeyDown, so we ignore KeyUp to prevent turning it off immediately.

      if (e.key === ' ') {
        setIsPanning(false);

        // Restore previous state
        if (previousToolRef.current) {
          const { isZoom, isPan } = previousToolRef.current;
          setIsZoomMode(isZoom);
          setIsPanMode(isPan);

          if (isZoom) {
            updateStatus('Zoom mode active - click to zoom in');
          } else if (isPan) {
            updateStatus('Pan mode active - drag to move');
          }
          // Reset ref
          previousToolRef.current = null;
        } else {
          // Fallback to Pan Mode as default
          setIsPanMode(true);
          setIsZoomMode(false);
          updateStatus('Pan mode active - drag to move');
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [originalImage, processingStatus, zoomOut, updateStatus, resetLayers, resetView]);

  // Clipboard paste handler
  const handlePaste = useCallback(async (e: ClipboardEvent) => {
    const items = Array.from(e.clipboardData?.items || []);

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          updateStatus('Processing pasted image...');
          processImageFile(file, 'pasted-image');
        }
        break;
      }
    }
  }, [processImageFile, updateStatus]);

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [handlePaste]);

  // Optimized image processing effect with debouncing
  useEffect(() => {
    // Don't process if essential conditions aren't met
    if (!previewImage || !showPreview) {
      return;
    }

    // Create a unique key for the current processing parameters
    const processingKey = JSON.stringify({
      hasPreview: !!previewImage,
      showPreview,
      layersHash: JSON.stringify(layers),
      algorithm,
      previewWidth: previewImage?.width,
      previewHeight: previewImage?.height,

    });

    // Prevent duplicate processing
    if (lastProcessingParamsRef.current === processingKey) {
      return;
    }

    // Clear any existing timeout
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
    }

    // Use short delay for responsive updates
    const delay = 150;

    processingTimeoutRef.current = setTimeout(() => {
      // Double-check that we should still process
      if (!previewImage || !showPreview || isProcessing) {
        return;
      }

      lastProcessingParamsRef.current = processingKey;

      // Process directly for instant feedback
      processImageOnCanvas(zoomLevel);
    }, delay);

    return () => {
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
    };
  }, [previewImage, showPreview, layers, algorithm, processImageOnCanvas, isProcessing]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
    };
  }, []);

  // Helper function to get default status message
  const getDefaultStatusMessage = () => {
    if (!originalImage) {
      return 'Ready to process images';
    }
    if (isZoomMode) {
      return 'Click to zoom in';
    }
    if (isPanMode) {
      return 'Drag to pan around image';
    }
    return 'Image loaded and ready';
  };

  return (
    <div
      className={`h-screen flex flex-col overflow-hidden surface-container-lowest ${isDragOver ? 'bg-primary/5' : ''}`}
      onDragEnter={!originalImage ? handleDragEnter : undefined}
      onDragLeave={!originalImage ? handleDragLeave : undefined}
      onDragOver={!originalImage ? handleDragOver : undefined}
      onDrop={!originalImage ? handleDrop : undefined}
    >
      <TopBar
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        handleBrowseClick={handleBrowseClick}
        handleClearImage={handleClearImage}
        isProcessing={isProcessing}
        originalImage={originalImage}
        originalFileName={originalFileName}
        downloadImage={downloadImage}
        exportImage={exportImage}
        fileInputRef={fileInputRef}
        handleImageUpload={handleImageUpload}
        isExportDialogOpen={isExportDialogOpen}
        setIsExportDialogOpen={setIsExportDialogOpen}
        generateSmartFilename={generateSmartFilename}
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        <div className="flex h-full">
          {/* Left Sidebar - Algorithm Settings */}
          {originalImage && (
            <div className="w-80 flex-shrink-0 overflow-y-auto p-4 border-r border-border surface-container-low" style={{ scrollbarGutter: 'stable' }}>
              <div className="space-y-3">
                <ControlsPanel
                  algorithm={algorithm}
                  onAlgorithmChange={setAlgorithm}
                  onApplyPreset={applyPreset}
                  colorPalette={colorPalette}
                  selectedLayer={selectedLayer}
                  getLayerName={getLayerName}
                  onApplyColor={(layerIndex, field, value) => {
                    const newLayers = [...layers];
                    newLayers[layerIndex] = { ...newLayers[layerIndex], [field]: value };
                    setLayers(newLayers);
                  }}
                  updateStatus={updateStatus}
                  undo={undo}
                  redo={redo}
                  canUndo={canUndo}
                  canRedo={canRedo}
                />
              </div>
            </div>
          )}

          {/* Preview Area - Center */}
          <div className="flex-1 overflow-hidden" ref={previewContainerRef}>
            {originalImage ? (
              <div className="p-4 h-full relative flex items-center justify-center">
                <PreviewArea
                  canvasRef={canvasRef}
                  zoomLevel={zoomLevel}
                  panOffset={panOffset}
                  showPreview={showPreview}
                  isZoomMode={isZoomMode}
                  isPanMode={isPanMode}
                  onCanvasClick={handleCanvasClick}
                  onPreviewMouseDown={handlePreviewMouseDown}
                  onPreviewMouseMove={handlePreviewMouseMove}
                  onPreviewMouseUp={handlePreviewMouseUp}
                  getCurrentCursor={getCurrentCursor}
                  onZoomChange={handleZoomChange}
                  onZoomIn={zoomIn}
                  onZoomOut={zoomOut}
                  onToggleZoomMode={toggleZoomMode}
                  onTogglePanMode={togglePanMode}
                  onResetView={fitToScreen}

                />
              </div>
            ) : (
              <div
                ref={dropZoneRef}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="h-full"
              >
                <SkeletonPreviewArea onBrowseClick={handleBrowseClick} isDragOver={isDragOver} />
              </div>
            )}
          </div>

          {/* Right Sidebar - Layer Settings */}
          {originalImage && (
            <div className="w-80 flex-shrink-0 overflow-y-auto p-4 border-l border-border surface-container-low" style={{ scrollbarGutter: 'stable' }}>
              <div className="space-y-3">
                <LayerControls
                  layers={layers}
                  selectedLayer={selectedLayer}
                  showPreview={showPreview}
                  onLayerUpdate={updateLayer}
                  onLayerSelect={setSelectedLayer}
                  onLayerCollapse={toggleLayerCollapse}
                  onLayerColorClick={handleLayerColorClick}
                  onResetLayers={resetLayers}
                  onTogglePreview={() => setShowPreview(!showPreview)}
                  generateSmartFilename={generateSmartFilename}
                  isOptimized={isOptimized}
                  onAddLayer={addLayer}
                  onDeleteLayer={deleteLayer}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer - Branding, Status, and Info */}
      {/* Footer - Branding, Status, and Info */}
      <Footer
        error={error}
        isProcessing={isProcessing}
        processingStatus={processingStatus}
        originalImage={originalImage}
        previewImage={previewImage}
        zoomLevel={zoomLevel}
        statusMessage={processingStatus || 'Ready'}
      />
    </div>
  );
}