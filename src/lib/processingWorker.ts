// Web Worker for image processing
// This runs in a separate thread to keep the UI responsive

import { LayerConfig, ThresholdAlgorithm } from './constants';
import { applyAlgorithm } from './algorithmDispatch';

export type ProcessingMessage = {
  type: 'process';
  imageData: ImageData;
  algorithm: string;
  layers: LayerConfig[];
  previewScaleRatio: number;
};

export type ProcessingResponse = {
  type: 'complete' | 'error';
  imageData?: ImageData;
  error?: string;
};

// Worker message handler
self.onmessage = (e: MessageEvent<ProcessingMessage>) => {
  const { type, imageData, algorithm, layers, previewScaleRatio } = e.data;

  if (type === 'process') {
    try {
      const processedData: ImageData = applyAlgorithm(
        algorithm as ThresholdAlgorithm,
        imageData,
        layers,
        previewScaleRatio
      );

      // Send back the processed data
      const response: ProcessingResponse = {
        type: 'complete',
        imageData: processedData
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      self.postMessage(response, [processedData.data.buffer] as any);
    } catch (error) {
      const response: ProcessingResponse = {
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      self.postMessage(response);
    }
  }
};
