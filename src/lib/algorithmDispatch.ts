import { LayerConfig, ThresholdAlgorithm } from './constants';
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

/**
 * Single dispatch point for all threshold algorithms.
 * Every render path (live preview, full-res download, export) goes through
 * this function so the per-algorithm mapping exists exactly once.
 */
export function applyAlgorithm(
  algorithm: ThresholdAlgorithm,
  imageData: ImageData,
  layers: LayerConfig[],
  scaleRatio: number
): ImageData {
  switch (algorithm) {
    case 'floyd-steinberg':
      return floydSteinbergDither(imageData, layers, scaleRatio);
    case 'ordered-dither':
      return orderedDither(imageData, layers, scaleRatio);
    case 'atkinson':
      return atkinsonDither(imageData, layers, scaleRatio);
    case 'jarvis-judice-ninke':
      return jarvisJudiceNinkeDither(imageData, layers, scaleRatio);
    case 'sierra':
      return sierraDither(imageData, layers, scaleRatio);
    case 'burkes':
      return burkesDither(imageData, layers, scaleRatio);
    case 'stucki':
      return stuckiDither(imageData, layers, scaleRatio);
    case 'riemersma':
      return riemersmaDither(imageData, layers, scaleRatio);
    case 'false-floyd-steinberg':
      return falseFloydSteinbergDither(imageData, layers, scaleRatio);
    case 'sierra-lite':
      return sierraLiteDither(imageData, layers, scaleRatio);
    // 'simple' and any unknown value fall back to plain layer processing
    default:
      return layerBasedProcessing(imageData, layers, scaleRatio);
  }
}
