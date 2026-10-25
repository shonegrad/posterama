import { useCallback, useRef, useState } from 'react';

/**
 * Zoom & pan state + helpers.
 *
 * Use this hook in ImageProcessor to replace the inlined refs,
 * calculateFitZoom, zoomIn/Out, togglePan/Zoom, fitToScreen, etc.
 *
 * The owning component must provide:
 *   - canvasRef: React.RefObject<HTMLCanvasElement | null> (passed via refs object)
 *   - updateStatus: (status: string) => void
 */
export function useZoomPan({ canvasRef }: { canvasRef: React.RefObject<HTMLCanvasElement | null> }) {
  // State
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanMode, setIsPanMode] = useState<boolean>(true);
  const [isZoomMode, setIsZoomMode] = useState<boolean>(false);

  // Ref for preventing infinite loops and measuring container
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // previewDebounceRef debounces reprocessing triggered by the effect below;
  // the owning component keeps its own independent debounce ref.
  const previewDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastProcessingParamsRef = useRef<string>('');

  // Calculate zoom to fit image within container bounds
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
    return Math.max(0.1, Math.min(fitScale, 16));
  }, []);

  // Zoom and pan functions
  const zoomIn = useCallback(() => {
    setZoomLevel(prev => {
      const newZoom = Math.min(prev * 1.5, 16);
      return newZoom;
    });
  }, []);

  const zoomOut = useCallback(() => {
    setZoomLevel(prev => {
      const newZoom = Math.max(prev / 1.5, 0.1);
      return newZoom;
    });
  }, []);

  const togglePanMode = useCallback(() => {
    setIsPanMode(prev => {
      const newPanMode = !prev;
      setIsZoomMode(false);
      return newPanMode;
    });
  }, []);

  const toggleZoomMode = useCallback(() => {
    setIsZoomMode(prev => {
      const newZoomMode = !prev;
      setIsPanMode(false);
      return newZoomMode;
    });
  }, []);

  const fitToScreen = useCallback(() => {
    if (!previewContainerRef.current || !canvasRef.current) return;
    const container = previewContainerRef.current;
    const padding = 32; // 2rem padding
    const availableWidth = Math.max(0, container.clientWidth - padding);
    const availableHeight = Math.max(0, container.clientHeight - padding);

    if (availableWidth === 0 || availableHeight === 0) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const imgWidth = rect.width || 1;
    const imgHeight = rect.height || 1;

    const wScale = availableWidth / imgWidth;
    const hScale = availableHeight / imgHeight;
    const fitScale = imgWidth > imgHeight ? wScale : hScale;

    setZoomLevel(Math.max(0.1, Math.min(fitScale, 16)));
    setPanOffset({ x: 0, y: 0 });
  }, [canvasRef]);

  // Expose refs for the owning component to wire up
  return {
    previewContainerRef,
    previewDebounceRef,
    lastProcessingParamsRef,

    // State
    zoomLevel,
    setZoomLevel,
    panOffset,
    setPanOffset,
    isPanMode,
    setIsPanMode,
    isZoomMode,
    setIsZoomMode,

    // Functions
    calculateFitZoom,
    zoomIn,
    zoomOut,
    togglePanMode,
    toggleZoomMode,
    fitToScreen
  };
}