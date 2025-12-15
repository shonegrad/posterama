// Web Worker for image processing
// This runs in a separate thread to keep the UI responsive

import { LayerConfig } from './constants';
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
} from './imageProcessing';

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
      let processedData: ImageData;

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
