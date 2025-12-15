import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { LayerConfig, ThresholdAlgorithm, ColorSwatch, DEFAULT_LAYERS, COLOR_PRESETS, IMAGE_SCALE_DEFAULT } from '../lib/constants';
import { createLayersWithExtractedColors, resizeImageForPreview, extractImageColors } from '../lib/imageUtils';
import { ALGORITHM_INFO } from '../lib/constants';
import {
  layerBasedProcessing,
  floydSteinbergDither,
  orderedDither,
  atkinsonDither,
  jarvisJudiceNinkeDither,
  sierraDither,
  burkesDither,
  stuckiDither,
  riemersmaDither,
  falseFloydSteinbergDither,
  sierraLiteDither
} from '../lib/imageProcessing';
import {
  canvasPool,
  extractImageData,
  renderToCanvas,
  DebouncedProcessor,

  perfMonitor
} from '../lib/renderOptimization';
import { useProcessingWorker } from './useProcessingWorker';
import { useHistory } from './useHistory';

interface ProcessorHistoryState {
  layers: LayerConfig[];
  algorithm: ThresholdAlgorithm;
}

export function useImageProcessor() {
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [previewImage, setPreviewImage] = useState<HTMLImageElement | ImageBitmap | null>(null);
  const [originalFileName, setOriginalFileName] = useState<string>('');
  const [isOptimized, setIsOptimized] = useState<boolean>(false);
  const [colorPalette, setColorPalette] = useState<ColorSwatch[]>([]);
  const [selectedLayer, setSelectedLayer] = useState<number>(0);


  // History state management
  const [historyState, historyActions] = useHistory<ProcessorHistoryState>({
    layers: [...DEFAULT_LAYERS],
    algorithm: 'atkinson'
  });

  const { layers, algorithm } = historyState;

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState<boolean>(true);
  const [presetSectionCollapsed, setPresetSectionCollapsed] = useState<boolean>(false);
  const [lastZoomThreshold, setLastZoomThreshold] = useState<number>(1);
  const [previewScaleRatio, setPreviewScaleRatio] = useState<number>(1);


  // Track last processed state to avoid redundant rework
  const lastProcessedRef = useRef<{
    algorithm: string;
    layersString: string;
    sourceImage: HTMLImageElement | ImageBitmap | null;
  }>({ algorithm: '', layersString: '', sourceImage: null });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { processImage, isAvailable: isWorkerAvailable } = useProcessingWorker();

  // Memoized status updates for better performance
  const updateStatus = useCallback((status: string) => {
    setProcessingStatus(status);
    console.log('Status:', status);
  }, []);

  // Clear image function - only clears image data, preserves settings

  // Clear image function - only clears image data, preserves settings
  const clearImage = useCallback(() => {
    // Clear canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Clear any pending processing
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
    }

    // Reset only image-related state
    setOriginalImage(null);
    setPreviewImage(null);
    setOriginalFileName('');
    setIsOptimized(false);
    setColorPalette([]);
    setIsProcessing(false);
    setProcessingStatus('');
    setError(null);
    setLastZoomThreshold(1);
    setPreviewScaleRatio(1);

    // Keep layers, algorithm, showPreview, selectedLayer, and other settings
    // These are preserved so the user doesn't lose their configuration

    // Optional: could choose to clear history here, but usually users might want to keep history
    // historyActions.clear({ layers: [...DEFAULT_LAYERS], algorithm: 'atkinson' });

    updateStatus('Image cleared');
  }, [canvasRef, fileInputRef, updateStatus]);

  // Wrappers for state updates that should be tracked in history
  const setLayers = useCallback((newLayers: LayerConfig[] | ((prev: LayerConfig[]) => LayerConfig[])) => {
    if (typeof newLayers === 'function') {
      historyActions.set({
        algorithm,
        layers: newLayers(layers)
      });
    } else {
      historyActions.set({
        algorithm,
        layers: newLayers
      });
    }
  }, [algorithm, layers, historyActions]);

  const setAlgorithm = useCallback((newAlgorithm: ThresholdAlgorithm) => {
    historyActions.set({
      layers,
      algorithm: newAlgorithm
    });
  }, [layers, historyActions]);

  // Image processing pipeline with auto-color assignment
  const processImageFile = useCallback(async (file: File, fileName?: string) => {
    console.log('Processing file:', file.name, file.type, file.size);

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPEG, PNG, WebP, etc.)');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setError('Image file is too large. Please select a file smaller than 25MB.');
      return;
    }

    setError(null);
    setIsProcessing(true);
    updateStatus('Reading image file...');
    setOriginalFileName(fileName || file.name.split('.')[0]);
    setAlgorithm('atkinson');

    try {
      const reader = new FileReader();

      const fileResult = await new Promise<string>((resolve, reject) => {
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });

      updateStatus('Decoding image...');

      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onerror = () => reject(new Error('Invalid image file'));
        image.onload = () => resolve(image);
        image.src = fileResult;
      });

      console.log('Image loaded:', img.width, 'x', img.height);

      updateStatus('Processing image...');
      setOriginalImage(img);

      updateStatus('Extracting color palette...');
      const extractedColors = extractImageColors(img);
      setColorPalette(extractedColors);

      updateStatus('Applying extracted colors to layers...');
      const colorizedLayers = createLayersWithExtractedColors(extractedColors);
      setLayers(colorizedLayers);
      setSelectedLayer(0);

      updateStatus('Optimizing image for preview...');
      // Calculate scale based on resolution mode
      const targetScale = 1.0;
      const { image: previewImg, scaleRatio } = await resizeImageForPreview(img, targetScale);
      console.log('Preview image created:', previewImg.width, 'x', previewImg.height, 'Scale ratio:', scaleRatio);

      setPreviewImage(previewImg);
      setPreviewScaleRatio(scaleRatio);
      setIsOptimized(scaleRatio < 1);
      setIsProcessing(false);
      updateStatus('Image loaded with extracted colors applied');

    } catch (err) {
      console.error('Error processing image:', err);
      setError(`Error processing the image: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsProcessing(false);
      setProcessingStatus('');
    }
  }, [updateStatus, setAlgorithm, setLayers]);

  // Add a new layer
  const addLayer = useCallback(() => {
    setLayers(prevLayers => {
      const newLayers = [...prevLayers];
      const backgroundLayer = newLayers.pop(); // Remove background

      // Create new layer
      const newLayer: LayerConfig = {
        color: '#10b981', // Emerald green default
        threshold: 128,
        opacity: 100,
        blendMode: 'normal',
        visible: true,
        pattern: 'none',
        patternSize: 4,
        patternRotation: 45,
        patternForegroundColor: '#10b981',
        patternBackgroundColor: 'transparent',
        collapsed: false
      };

      // Add new layer at the very top (index 0)
      newLayers.unshift(newLayer);
      if (backgroundLayer) {
        newLayers.push(backgroundLayer);
      }
      return newLayers;
    });
    updateStatus('Added new layer');
  }, [setLayers, updateStatus]);

  // Re-process preview when resolutionMode changes


  // Delete a layer
  const deleteLayer = useCallback((index: number) => {
    setLayers(prevLayers => {
      // Don't allow deleting if only background remains
      if (prevLayers.length <= 1) {
        updateStatus('Cannot delete the only remaining layer');
        return prevLayers;
      }

      // Don't allow deleting background
      if (index === prevLayers.length - 1) {
        updateStatus('Cannot delete background layer');
        return prevLayers;
      }

      const newLayers = prevLayers.filter((_, i) => i !== index);
      updateStatus('Deleted layer');
      return newLayers;
    });
  }, [setLayers, updateStatus]);

  // Optimized canvas processing - processes off-screen to prevent flickering
  const processImageOnCanvas = useCallback((zoomLevel: number) => {
    if (!previewImage || !showPreview || !canvasRef.current || isProcessing) {
      return;
    }

    // Clear any existing processing timeout
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
    }

    const layersString = JSON.stringify(layers);

    // Check if we actually need to re-process
    // We re-process only if: algorithm changed, layers changed, or we don't have a cached result
    if (
      algorithm === lastProcessedRef.current.algorithm &&
      layersString === lastProcessedRef.current.layersString &&
      lastProcessedRef.current.sourceImage &&
      !isProcessing
    ) {
      // Nothing changed materially, skip processing
      return;
    }

    // Use previewImage as the primary source - it is now correctly sized
    const processingImage = previewImage || originalImage;

    if (!processingImage) return;

    try {
      updateStatus(`Processing with ${ALGORITHM_INFO[algorithm].name} at ${Math.round(zoomLevel * 100)}%...`);

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('Failed to get canvas context');
        return;
      }

      const processWithImage = (img: HTMLImageElement | ImageBitmap) => {
        try {
          // Prevent processing if component is unmounting or processing
          if (!canvas || !ctx || isProcessing) return;

          // Limit maximum image size for performance
          const maxSize = 1200; // Maximum width or height for processing
          let targetWidth = img.width;
          let targetHeight = img.height;

          // Scale down if too large
          if (targetWidth > maxSize || targetHeight > maxSize) {
            const scale = Math.min(maxSize / targetWidth, maxSize / targetHeight);
            targetWidth = Math.floor(targetWidth * scale);
            targetHeight = Math.floor(targetHeight * scale);
          }

          // Create off-screen canvas for processing
          const offscreenCanvas = document.createElement('canvas');
          offscreenCanvas.width = targetWidth;
          offscreenCanvas.height = targetHeight;
          const offscreenCtx = offscreenCanvas.getContext('2d');

          if (!offscreenCtx) {
            console.error('Failed to create offscreen canvas context');
            return;
          }

          offscreenCtx.imageSmoothingEnabled = false;
          offscreenCtx.drawImage(img, 0, 0, targetWidth, targetHeight);

          // Process off-screen without delay
          // Process with worker if available, otherwise fall back to sync (or stick to sync if worker fails)
          if (isWorkerAvailable) {
            processImage(
              offscreenCtx.getImageData(0, 0, targetWidth, targetHeight),
              algorithm,
              layers,
              previewScaleRatio,
              (processedData) => {
                // Success callback
                requestAnimationFrame(() => {
                  if (canvas && ctx) { // removed !isProcessing check here as we are finishing processing
                    // Force resize visible canvas to match processing image
                    canvas.width = img.width;
                    canvas.height = img.height;

                    ctx.imageSmoothingEnabled = false;
                    ctx.putImageData(processedData, 0, 0);

                    // Update cache ref
                    lastProcessedRef.current = {
                      algorithm,
                      layersString: JSON.stringify(layers),
                      sourceImage: processingImage
                    };

                    updateStatus('Processing complete');
                    setIsProcessing(false);
                  }
                });

                // Clean up offscreen canvas
                offscreenCanvas.width = 1;
                offscreenCanvas.height = 1;
              },
              (err) => {
                // Error callback
                console.error('Worker processing error:', err);
                updateStatus('Processing failed');
                setIsProcessing(false);
              }
            );
          } else {
            // Synchronous fallback (legacy code)
            try {
              const imageData = offscreenCtx.getImageData(0, 0, targetWidth, targetHeight);
              let processedData: ImageData;

              // Process synchronously for instant results
              switch (algorithm) {
                case 'floyd-steinberg':
                  processedData = floydSteinbergDither(imageData, layers, previewScaleRatio);
                  break;
                case 'ordered-dither':
                  processedData = orderedDither(imageData, layers, previewScaleRatio);
                  break;
                case 'atkinson':
                  processedData = atkinsonDither(imageData, layers, previewScaleRatio);
                  break;
                case 'jarvis-judice-ninke':
                  processedData = jarvisJudiceNinkeDither(imageData, layers, previewScaleRatio);
                  break;
                case 'sierra':
                  processedData = sierraDither(imageData, layers, previewScaleRatio);
                  break;
                case 'burkes':
                  processedData = burkesDither(imageData, layers, previewScaleRatio);
                  break;
                case 'stucki':
                  processedData = stuckiDither(imageData, layers, previewScaleRatio);
                  break;
                case 'riemersma':
                  processedData = riemersmaDither(imageData, layers, previewScaleRatio);
                  break;
                case 'false-floyd-steinberg':
                  processedData = falseFloydSteinbergDither(imageData, layers, previewScaleRatio);
                  break;
                case 'sierra-lite':
                  processedData = sierraLiteDither(imageData, layers, previewScaleRatio);
                  break;
                default:
                  processedData = layerBasedProcessing(imageData, layers, previewScaleRatio);
              }

              // Only now update the visible canvas with processed result
              requestAnimationFrame(() => {
                if (canvas && ctx) {
                  // Resize visible canvas if needed
                  if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
                    canvas.width = targetWidth;
                    canvas.height = targetHeight;
                  }

                  ctx.imageSmoothingEnabled = false;
                  ctx.putImageData(processedData, 0, 0);

                  // Update cache ref
                  lastProcessedRef.current = {
                    algorithm,
                    layersString: JSON.stringify(layers),
                    sourceImage: processingImage
                  };

                  updateStatus('Processing complete');
                  setIsProcessing(false);
                }
              });

              // Clean up offscreen canvas
              offscreenCanvas.width = 1;
              offscreenCanvas.height = 1;
            } catch (err) {
              console.error('Canvas processing error:', err);
              updateStatus('Processing failed');
              setIsProcessing(false);
            }
          }
        } catch (err) {
          console.error('Canvas processing error:', err);
          updateStatus('Processing failed');
          setIsProcessing(false);
        }
      };

      if (processingImage === previewImage) {
        setIsProcessing(true); // Ensure lock is set before starting
        processWithImage(processingImage as HTMLImageElement | ImageBitmap);
      } else {
        // Safe check for complete property which exists on HTMLImageElement but not ImageBitmap
        const isComplete = processingImage instanceof HTMLImageElement ? processingImage.complete : true;

        if (isComplete) {
          setIsProcessing(true);
          processWithImage(processingImage as HTMLImageElement | ImageBitmap);
        } else if (processingImage instanceof HTMLImageElement) {
          setIsProcessing(true);
          processingImage.onload = () => processWithImage(processingImage);
          // Add timeout for image loading
          processingTimeoutRef.current = setTimeout(() => {
            updateStatus('Image processing timeout');
            setIsProcessing(false);
          }, 15000); // Increased timeout
        } else {
          // Should be covered by isComplete=true for ImageBitmap, but fallback
          setIsProcessing(true);
          processWithImage(processingImage as ImageBitmap);
        }
      }

    } catch (err) {
      console.error('Canvas processing error:', err);
      updateStatus('Processing failed');
      setIsProcessing(false);
    }
  }, [previewImage, layers, algorithm, showPreview, originalImage, isProcessing, updateStatus, processImage, isWorkerAvailable]);

  // Download processed image (full resolution) with timeout handling
  const downloadImage = useCallback(async () => {
    if (!originalImage || isProcessing) return;

    setIsProcessing(true);

    const downloadPromise = (async () => {
      updateStatus('Generating full resolution image...');

      try {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) {
          throw new Error('Failed to create canvas context');
        }

        tempCanvas.width = originalImage.width;
        tempCanvas.height = originalImage.height;
        tempCtx.imageSmoothingEnabled = false;
        tempCtx.drawImage(originalImage, 0, 0, originalImage.width, originalImage.height);

        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        let processedData: ImageData;

        const fullResScaleRatio = 1;

        switch (algorithm) {
          case 'floyd-steinberg':
            processedData = floydSteinbergDither(imageData, layers, fullResScaleRatio);
            break;
          case 'ordered-dither':
            processedData = orderedDither(imageData, layers, fullResScaleRatio);
            break;
          case 'atkinson':
            processedData = atkinsonDither(imageData, layers, fullResScaleRatio);
            break;
          case 'jarvis-judice-ninke':
            processedData = jarvisJudiceNinkeDither(imageData, layers, fullResScaleRatio);
            break;
          case 'sierra':
            processedData = sierraDither(imageData, layers, fullResScaleRatio);
            break;
          case 'burkes':
            processedData = burkesDither(imageData, layers, fullResScaleRatio);
            break;
          case 'stucki':
            processedData = stuckiDither(imageData, layers, fullResScaleRatio);
            break;
          case 'riemersma':
            processedData = riemersmaDither(imageData, layers, fullResScaleRatio);
            break;
          case 'false-floyd-steinberg':
            processedData = falseFloydSteinbergDither(imageData, layers, fullResScaleRatio);
            break;
          case 'sierra-lite':
            processedData = sierraLiteDither(imageData, layers, fullResScaleRatio);
            break;
          default:
            processedData = layerBasedProcessing(imageData, layers, fullResScaleRatio);
        }

        tempCtx.putImageData(processedData, 0, 0);

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

        const fileName = originalFileName || 'image';
        const smartFilename = `${fileName}-${algorithmShort}-${timestamp}`;


        // Use toBlob for download (works in Firefox)
        await new Promise<void>((resolve, reject) => {
          tempCanvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Canvas to Blob failed'));
              return;
            }

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `${smartFilename}.png`;
            link.href = url;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            resolve();
          }, 'image/png');
        });

        // Clean up
        tempCanvas.width = 1;
        tempCanvas.height = 1;

        updateStatus('Full resolution image downloaded');
        setTimeout(() => setProcessingStatus(''), 2000);

        return smartFilename;
      } catch (err) {
        console.error('Download error:', err);
        setError('Failed to download image');
        updateStatus('Download failed');
        throw err;
      } finally {
        setIsProcessing(false);
      }
    })();

    toast.promise(downloadPromise, {
      loading: 'Generating full resolution image...',
      success: (filename) => `Downloaded ${filename}.png`,
      error: 'Failed to download image'
    });

  }, [originalImage, algorithm, layers, originalFileName, isProcessing, updateStatus]);

  // Unified export function using worker
  const exportImage = useCallback(async (options: { format: string; quality: number; scale: number; filename: string }) => {
    if (!originalImage || isProcessing) return;

    setIsProcessing(true);
    updateStatus('Initializing export...');

    const exportPromise = (async () => {
      try {
        const { format, quality, scale, filename } = options;

        // Apply export scale
        const resScale = 1.0;
        const finalScale = scale * resScale;

        // Calculate dimensions
        const targetWidth = Math.round(originalImage.width * finalScale);
        const targetHeight = Math.round(originalImage.height * finalScale);

        updateStatus(`Preparing image (${targetWidth}x${targetHeight})...`);

        // Create temp canvas
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = targetWidth;
        tempCanvas.height = targetHeight;
        const ctx = tempCanvas.getContext('2d');

        if (!ctx) throw new Error('Failed to create canvas context');

        // Draw and scale original image
        ctx.imageSmoothingEnabled = scale > 1;
        ctx.drawImage(originalImage, 0, 0, targetWidth, targetHeight);

        // Get image data for processing
        const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);

        updateStatus('Processing in background...');

        // Process in worker
        const processedData = await new Promise<ImageData>((resolve, reject) => {
          if (isWorkerAvailable) {
            processImage(
              imageData,
              algorithm,
              layers,
              1,
              resolve,
              reject
            );
          } else {
            // Fallback for no worker
            try {
              let processedData: ImageData;
              switch (algorithm) {
                case 'floyd-steinberg':
                  processedData = floydSteinbergDither(imageData, layers, 1);
                  break;
                case 'ordered-dither':
                  processedData = orderedDither(imageData, layers, 1);
                  break;
                case 'atkinson':
                  processedData = atkinsonDither(imageData, layers, 1);
                  break;
                case 'jarvis-judice-ninke':
                  processedData = jarvisJudiceNinkeDither(imageData, layers, 1);
                  break;
                case 'sierra':
                  processedData = sierraDither(imageData, layers, 1);
                  break;
                case 'burkes':
                  processedData = burkesDither(imageData, layers, 1);
                  break;
                case 'stucki':
                  processedData = stuckiDither(imageData, layers, 1);
                  break;
                case 'riemersma':
                  processedData = riemersmaDither(imageData, layers, 1);
                  break;
                case 'false-floyd-steinberg':
                  processedData = falseFloydSteinbergDither(imageData, layers, 1);
                  break;
                case 'sierra-lite':
                  processedData = sierraLiteDither(imageData, layers, 1);
                  break;
                default:
                  processedData = layerBasedProcessing(imageData, layers, 1);
              }
              resolve(processedData);
            } catch (e) {
              reject(e);
            }
          }
        });

        updateStatus('Finalizing export file...');

        // Put processed data back
        ctx.putImageData(processedData, 0, 0);

        // Generate download using toBlob (works in Firefox)
        const mimeType = `image/${format}`;
        await new Promise<void>((resolve, reject) => {
          tempCanvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Failed to create image blob'));
              return;
            }

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `${filename}.${format}`;
            link.href = url;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            resolve();
          }, mimeType, quality);
        });

        tempCanvas.width = 1;
        tempCanvas.height = 1;

        updateStatus('Export complete');
        setTimeout(() => setProcessingStatus(''), 2000);

        return `${filename}.${format}`;

      } catch (err) {
        console.error('Export error:', err);
        setError('Failed to export image');
        updateStatus('Export failed');
        throw err;
      } finally {
        setIsProcessing(false);
      }
    })();

    toast.promise(exportPromise, {
      loading: 'Exporting image...',
      success: (filename) => `Successfully exported ${filename}`,
      error: 'Failed to export image'
    });
  }, [originalImage, layers, algorithm, isProcessing, isWorkerAvailable, processImage, updateStatus]);



  return {
    // State
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
    presetSectionCollapsed,
    lastZoomThreshold,
    previewScaleRatio,

    // Refs
    canvasRef,
    fileInputRef,
    dropZoneRef,

    // Actions
    setSelectedLayer,
    setLayers,
    setAlgorithm,
    setShowPreview,
    setPresetSectionCollapsed,
    setError,

    // Functions
    updateStatus,
    processImageFile,
    processImageOnCanvas,
    clearImage,
    downloadImage,
    exportImage, // New export function
    addLayer,
    deleteLayer,

    // History
    undo: historyActions.undo,
    redo: historyActions.redo,
    canUndo: historyActions.canUndo,
    canRedo: historyActions.canRedo
  };
}