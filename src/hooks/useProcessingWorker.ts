import { useRef, useCallback, useEffect, useState } from 'react';
import { LayerConfig } from '../lib/constants';
// Import the worker using Vite's query suffix
// @ts-expect-error - Worker import is handled by Vite
import ImageWorker from '../lib/processingWorker.ts?worker';

type ProcessingCallback = (imageData: ImageData) => void;
type ErrorCallback = (error: string) => void;

export function useProcessingWorker() {
  const workerRef = useRef<Worker | null>(null);
  const callbacksRef = useRef<{
    onComplete?: ProcessingCallback;
    onError?: ErrorCallback;
  }>({});

  const [isReady, setIsReady] = useState<boolean>(false);

  // Initialize worker
  useEffect(() => {
    try {
      // Instantiate the imported worker
      console.log('Using worker from import:', ImageWorker);
      workerRef.current = new ImageWorker();
      console.log('Worker instantiated successfully');
      setIsReady(true);

      if (workerRef.current) {
        workerRef.current.onmessage = (e) => {
          const { type, imageData, error } = e.data;

          if (type === 'complete' && imageData && callbacksRef.current.onComplete) {
            callbacksRef.current.onComplete(imageData);
          } else if (type === 'error' && callbacksRef.current.onError) {
            callbacksRef.current.onError(error || 'Unknown worker error');
          }
        };

        workerRef.current.onerror = (error) => {
          console.error('Worker error:', error);
          if (callbacksRef.current.onError) {
            callbacksRef.current.onError('Worker failed to process image');
          }
        };
      }
    } catch (error) {
      console.error('Failed to create worker:', error);
      setIsReady(false);
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
        setIsReady(false);
      }
    };
  }, []);

  const processImage = useCallback(
    (
      imageData: ImageData,
      algorithm: string,
      layers: LayerConfig[],
      previewScaleRatio: number,
      onComplete: ProcessingCallback,
      onError: ErrorCallback
    ) => {
      if (!workerRef.current) {
        onError('Worker not initialized');
        return;
      }

      // Store callbacks
      callbacksRef.current = { onComplete, onError };

      // Send processing request to worker
      try {
        workerRef.current.postMessage(
          {
            type: 'process',
            imageData,
            algorithm,
            layers,
            previewScaleRatio
          },
          [imageData.data.buffer] // Transfer buffer for better performance
        );
      } catch (error) {
        console.error('Failed to post message to worker:', error);
        onError('Failed to send data to worker');
      }
    },
    []
  );

  return {
    processImage,
    isAvailable: isReady
  };
}
