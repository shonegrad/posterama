import { LayerConfig } from './constants';
import { applyBlendMode } from './blendModes';
import * as PatternGenerators from './patternGeneration';

// Apply layer with pattern logic
export const applyLayerWithPattern = (
  x: number,
  y: number,
  gray: number,
  layer: LayerConfig,
  baseR: number,
  baseG: number,
  baseB: number,
  previewScaleRatio: number
): [number, number, number] => {
  let patternR = baseR, patternG = baseG, patternB = baseB;

  // Check if pattern mode is enabled
  if (layer.usePattern && layer.pattern !== 'none') {
    // Use the layer color as the pattern foreground color
    const fgColor = layer.color;

    switch (layer.pattern) {
      case 'halftone':
        [patternR, patternG, patternB] = PatternGenerators.generateHalftonePattern(x, y, gray, layer.patternSize, layer.patternRotation, fgColor, layer.patternBackgroundColor, previewScaleRatio, layer.patternSpacing || 0);
        break;
      case 'screentone':
        [patternR, patternG, patternB] = PatternGenerators.generateScreentonePattern(x, y, gray, layer.patternSize, layer.patternRotation, fgColor, layer.patternBackgroundColor, previewScaleRatio, layer.patternSpacing || 0);
        break;
      case 'noise':
        [patternR, patternG, patternB] = PatternGenerators.generateNoisePattern(x, y, gray, layer.patternSize, layer.patternRotation, fgColor, layer.patternBackgroundColor, layer.patternSpacing || 0);
        break;
      case 'crosshatch':
        [patternR, patternG, patternB] = PatternGenerators.generateCrosshatchPattern(x, y, gray, layer.patternSize, layer.patternRotation, fgColor, layer.patternBackgroundColor, previewScaleRatio, layer.patternSpacing || 0);
        break;
      case 'stippling':
        [patternR, patternG, patternB] = PatternGenerators.generateStipplingPattern(x, y, gray, layer.patternSize, layer.patternRotation, fgColor, layer.patternBackgroundColor, layer.patternSpacing || 0);
        break;
      case 'newspaper':
        [patternR, patternG, patternB] = PatternGenerators.generateNewspaperPattern(x, y, gray, layer.patternSize, layer.patternRotation, fgColor, layer.patternBackgroundColor, previewScaleRatio, layer.patternSpacing || 0);
        break;
      case 'dots':
        [patternR, patternG, patternB] = PatternGenerators.generateDotsPattern(x, y, layer.patternSize, layer.patternRotation, fgColor, layer.patternBackgroundColor, previewScaleRatio, layer.patternSpacing || 0);
        break;
      case 'lines':
        [patternR, patternG, patternB] = PatternGenerators.generateLinesPattern(x, y, layer.patternSize, layer.patternRotation, fgColor, layer.patternBackgroundColor, previewScaleRatio, layer.patternSpacing || 0);
        break;
      case 'waves':
        [patternR, patternG, patternB] = PatternGenerators.generateWavesPattern(x, y, layer.patternSize, layer.patternRotation, fgColor, layer.patternBackgroundColor, previewScaleRatio, layer.patternSpacing || 0);
        break;
      case 'hexagon':
        [patternR, patternG, patternB] = PatternGenerators.generateHexagonPattern(x, y, layer.patternSize, layer.patternRotation, fgColor, layer.patternBackgroundColor, previewScaleRatio, layer.patternSpacing || 0);
        break;
      case 'brick':
        [patternR, patternG, patternB] = PatternGenerators.generateBrickPattern(x, y, layer.patternSize, layer.patternRotation, fgColor, layer.patternBackgroundColor, previewScaleRatio, layer.patternSpacing || 0);
        break;
      case 'fabric':
        [patternR, patternG, patternB] = PatternGenerators.generateFabricPattern(x, y, layer.patternSize, layer.patternRotation, fgColor, layer.patternBackgroundColor, previewScaleRatio, layer.patternSpacing || 0);
        break;
    }

    return applyBlendMode(baseR, baseG, baseB, patternR, patternG, patternB, layer.blendMode, layer.opacity);
  } else {
    // No pattern, use layer color
    const hex = layer.color.substring(1);
    const rLayer = parseInt(hex.substring(0, 2), 16);
    const gLayer = parseInt(hex.substring(2, 4), 16);
    const bLayer = parseInt(hex.substring(4, 6), 16);

    return applyBlendMode(baseR, baseG, baseB, rLayer, gLayer, bLayer, layer.blendMode, layer.opacity);
  }
};

// Core layer-based processing
export const layerBasedProcessing = (imageData: ImageData, layers: LayerConfig[], previewScaleRatio: number): ImageData => {
  const data = new Uint8ClampedArray(imageData.data);
  const processedData = new ImageData(imageData.width, imageData.height);
  const processed = processedData.data;
  const width = imageData.width;
  const height = imageData.height;

  const backgroundLayer = layers[layers.length - 1];
  const thresholdLayers = layers.slice(0, layers.length - 1).filter(layer => layer.visible !== false);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const originalR = data[i];
      const originalG = data[i + 1];
      const originalB = data[i + 2];
      const a = data[i + 3];

      const gray = Math.round(0.299 * originalR + 0.587 * originalG + 0.114 * originalB);

      // Start with transparent base
      let currentR = 0;
      let currentG = 0;
      let currentB = 0;
      let currentA = 0;

      // Apply background layer if visible
      if (backgroundLayer.visible !== false) {
        // Get pure background color (force normal/100%)
        [currentR, currentG, currentB] = applyLayerWithPattern(
          x, y, gray,
          { ...backgroundLayer, opacity: 100, blendMode: 'normal' },
          0, 0, 0,
          previewScaleRatio
        );
        currentA = (backgroundLayer.opacity / 100) * 255;
      }

      for (let layerIndex = 0; layerIndex < thresholdLayers.length; layerIndex++) {
        const layer = thresholdLayers[layerIndex];

        if (gray <= (layer.threshold || 255)) {
          // Get target color with full opacity blended over current
          const [targetR, targetG, targetB] = applyLayerWithPattern(
            x, y, gray,
            { ...layer, opacity: 100 },
            currentR, currentG, currentB,
            previewScaleRatio
          );

          const opacity = layer.opacity / 100;

          // Blend RGB
          currentR = currentR * (1 - opacity) + targetR * opacity;
          currentG = currentG * (1 - opacity) + targetG * opacity;
          currentB = currentB * (1 - opacity) + targetB * opacity;

          // Accumulate Alpha
          currentA = currentA + (255 - currentA) * opacity;
          break;
        }
      }

      processed[i] = currentR;
      processed[i + 1] = currentG;
      processed[i + 2] = currentB;
      processed[i + 3] = currentA;
    }
  }

  return processedData;
};

// Floyd-Steinberg Dithering with serpentine scanning
export const floydSteinbergDither = (imageData: ImageData, layers: LayerConfig[], previewScaleRatio: number): ImageData => {
  const data = new Uint8ClampedArray(imageData.data);
  const width = imageData.width;
  const height = imageData.height;
  const backgroundLayer = layers[layers.length - 1];
  const thresholdLayers = layers.slice(0, layers.length - 1).filter(layer => layer.visible !== false);

  // Create a copy for error accumulation
  const grayData = new Float32Array(width * height);

  // Convert to grayscale first
  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    grayData[i] = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
  }

  const processedData = new ImageData(width, height);
  const processed = processedData.data;

  for (let y = 0; y < height; y++) {
    // Serpentine scanning: alternate direction each row
    const direction = y % 2 === 0 ? 1 : -1;
    const xStart = y % 2 === 0 ? 0 : width - 1;
    const xEnd = y % 2 === 0 ? width : -1;

    for (let x = xStart; x !== xEnd; x += direction) {
      const i = y * width + x;
      const idx = i * 4;

      const oldGray = grayData[i];

      let selectedLayer = backgroundLayer;
      for (const layer of thresholdLayers) {
        if (oldGray <= (layer.threshold || 255)) {
          selectedLayer = layer;
          break;
        }
      }

      const targetValue = selectedLayer.threshold || 128;
      const error = oldGray - targetValue;

      // Apply layer styling
      const originalR = data[idx];
      const originalG = data[idx + 1];
      const originalB = data[idx + 2];

      // Apply layer styling

      // Start with transparent base
      let currentR = 0;
      let currentG = 0;
      let currentB = 0;
      let currentA = 0;

      if (backgroundLayer.visible !== false) {
        [currentR, currentG, currentB] = applyLayerWithPattern(
          x, y, Math.round(oldGray),
          { ...backgroundLayer, opacity: 100, blendMode: 'normal' },
          0, 0, 0,
          previewScaleRatio
        );
        currentA = (backgroundLayer.opacity / 100) * 255;
      }

      if (selectedLayer !== backgroundLayer && selectedLayer.visible !== false) {
        const [targetR, targetG, targetB] = applyLayerWithPattern(
          x, y, Math.round(oldGray),
          { ...selectedLayer, opacity: 100 },
          currentR, currentG, currentB,
          previewScaleRatio
        );

        const opacity = selectedLayer.opacity / 100;

        currentR = currentR * (1 - opacity) + targetR * opacity;
        currentG = currentG * (1 - opacity) + targetG * opacity;
        currentB = currentB * (1 - opacity) + targetB * opacity;

        currentA = currentA + (255 - currentA) * opacity;
      }

      processed[idx] = currentR;
      processed[idx + 1] = currentG;
      processed[idx + 2] = currentB;
      processed[idx + 3] = currentA;

      // Distribute error using Floyd-Steinberg weights (adapted for serpentine)
      if (x + direction >= 0 && x + direction < width) {
        grayData[i + direction] += error * 7 / 16;
      }

      if (y < height - 1) {
        if (x - direction >= 0 && x - direction < width) {
          grayData[i + width - direction] += error * 3 / 16;
        }
        grayData[i + width] += error * 5 / 16;
        if (x + direction >= 0 && x + direction < width) {
          grayData[i + width + direction] += error * 1 / 16;
        }
      }
    }
  }

  return processedData;
};

// Ordered Dithering
export const orderedDither = (imageData: ImageData, layers: LayerConfig[], previewScaleRatio: number): ImageData => {
  const data = new Uint8ClampedArray(imageData.data);
  const width = imageData.width;
  const height = imageData.height;
  const backgroundLayer = layers[layers.length - 1];
  const thresholdLayers = layers.slice(0, layers.length - 1).filter(layer => layer.visible !== false);

  const bayerMatrix = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5]
  ];

  const processedData = new ImageData(width, height);
  const processed = processedData.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);

      // Apply Bayer matrix threshold
      const bayerValue = bayerMatrix[y % 4][x % 4];
      const threshold = (bayerValue / 15) * 64 - 32; // Scale and center around 0
      const ditheredGray = Math.max(0, Math.min(255, gray + threshold));

      let selectedLayer = backgroundLayer;
      for (const layer of thresholdLayers) {
        if (ditheredGray <= (layer.threshold || 255)) {
          selectedLayer = layer;
          break;
        }
      }

      // Start with transparent base
      let currentR = 0;
      let currentG = 0;
      let currentB = 0;
      let currentA = 0;

      if (backgroundLayer.visible !== false) {
        [currentR, currentG, currentB] = applyLayerWithPattern(
          x, y, gray,
          { ...backgroundLayer, opacity: 100, blendMode: 'normal' },
          0, 0, 0,
          previewScaleRatio
        );
        currentA = (backgroundLayer.opacity / 100) * 255;
      }

      if (selectedLayer !== backgroundLayer && selectedLayer.visible !== false) {
        const [targetR, targetG, targetB] = applyLayerWithPattern(
          x, y, gray,
          { ...selectedLayer, opacity: 100 },
          currentR, currentG, currentB,
          previewScaleRatio
        );

        const opacity = selectedLayer.opacity / 100;

        currentR = currentR * (1 - opacity) + targetR * opacity;
        currentG = currentG * (1 - opacity) + targetG * opacity;
        currentB = currentB * (1 - opacity) + targetB * opacity;

        currentA = currentA + (255 - currentA) * opacity;
      }

      processed[idx] = currentR;
      processed[idx + 1] = currentG;
      processed[idx + 2] = currentB;
      processed[idx + 3] = currentA;
    }
  }

  return processedData;
};

// Atkinson Dithering
export const atkinsonDither = (imageData: ImageData, layers: LayerConfig[], previewScaleRatio: number): ImageData => {
  const data = new Uint8ClampedArray(imageData.data);
  const width = imageData.width;
  const height = imageData.height;
  const backgroundLayer = layers[layers.length - 1];
  const thresholdLayers = layers.slice(0, layers.length - 1).filter(layer => layer.visible !== false);

  // Create a copy for error accumulation
  const grayData = new Float32Array(width * height);

  // Convert to grayscale first
  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    grayData[i] = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
  }

  const processedData = new ImageData(width, height);
  const processed = processedData.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const idx = i * 4;

      const oldGray = grayData[i];

      let selectedLayer = backgroundLayer;
      for (const layer of thresholdLayers) {
        if (oldGray <= (layer.threshold || 255)) {
          selectedLayer = layer;
          break;
        }
      }

      const targetValue = selectedLayer.threshold || 128;
      const error = oldGray - targetValue;

      // Apply layer styling
      const originalR = data[idx];
      const originalG = data[idx + 1];
      const originalB = data[idx + 2];

      // Start with transparent base
      let currentR = 0;
      let currentG = 0;
      let currentB = 0;
      let currentA = 0;

      if (backgroundLayer.visible !== false) {
        [currentR, currentG, currentB] = applyLayerWithPattern(
          x, y, Math.round(oldGray),
          { ...backgroundLayer, opacity: 100, blendMode: 'normal' },
          0, 0, 0,
          previewScaleRatio
        );
        currentA = (backgroundLayer.opacity / 100) * 255;
      }

      if (selectedLayer !== backgroundLayer && selectedLayer.visible !== false) {
        const [targetR, targetG, targetB] = applyLayerWithPattern(
          x, y, Math.round(oldGray),
          { ...selectedLayer, opacity: 100 },
          currentR, currentG, currentB,
          previewScaleRatio
        );

        const opacity = selectedLayer.opacity / 100;

        currentR = currentR * (1 - opacity) + targetR * opacity;
        currentG = currentG * (1 - opacity) + targetG * opacity;
        currentB = currentB * (1 - opacity) + targetB * opacity;

        currentA = currentA + (255 - currentA) * opacity;
      }

      processed[idx] = currentR;
      processed[idx + 1] = currentG;
      processed[idx + 2] = currentB;
      processed[idx + 3] = currentA;

      // Atkinson dithering error distribution (1/8 to each neighbor)
      const errorFraction = error / 8;

      if (x < width - 1) {
        grayData[i + 1] += errorFraction;
      }

      if (x < width - 2) {
        grayData[i + 2] += errorFraction;
      }

      if (y < height - 1) {
        if (x > 0) {
          grayData[i + width - 1] += errorFraction;
        }
        grayData[i + width] += errorFraction;
        if (x < width - 1) {
          grayData[i + width + 1] += errorFraction;
        }
      }

      if (y < height - 2) {
        grayData[i + width * 2] += errorFraction;
      }
    }
  }

  return processedData;
};

// Generic error diffusion function
export const applyErrorDiffusion = (
  imageData: ImageData,
  layers: LayerConfig[],
  matrix: number[][],
  divisor: number,
  previewScaleRatio: number
): ImageData => {
  const data = new Uint8ClampedArray(imageData.data);
  const width = imageData.width;
  const height = imageData.height;
  const backgroundLayer = layers[layers.length - 1];
  const thresholdLayers = layers.slice(0, layers.length - 1).filter(layer => layer.visible !== false);

  // Create a copy for error accumulation
  const grayData = new Float32Array(width * height);

  // Convert to grayscale first
  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    grayData[i] = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
  }

  const processedData = new ImageData(width, height);
  const processed = processedData.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const idx = i * 4;

      const oldGray = grayData[i];

      let selectedLayer = backgroundLayer;
      for (const layer of thresholdLayers) {
        if (oldGray <= (layer.threshold || 255)) {
          selectedLayer = layer;
          break;
        }
      }

      const targetValue = selectedLayer.threshold || 128;
      const error = oldGray - targetValue;

      // Apply layer styling
      const originalR = data[idx];
      const originalG = data[idx + 1];
      const originalB = data[idx + 2];

      // Start with transparent base
      let currentR = 0;
      let currentG = 0;
      let currentB = 0;
      let currentA = 0;

      if (backgroundLayer.visible !== false) {
        [currentR, currentG, currentB] = applyLayerWithPattern(
          x, y, Math.round(oldGray),
          { ...backgroundLayer, opacity: 100, blendMode: 'normal' },
          0, 0, 0,
          previewScaleRatio
        );
        currentA = (backgroundLayer.opacity / 100) * 255;
      }

      if (selectedLayer !== backgroundLayer && selectedLayer.visible !== false) {
        const [targetR, targetG, targetB] = applyLayerWithPattern(
          x, y, Math.round(oldGray),
          { ...selectedLayer, opacity: 100 },
          currentR, currentG, currentB,
          previewScaleRatio
        );

        const opacity = selectedLayer.opacity / 100;

        currentR = currentR * (1 - opacity) + targetR * opacity;
        currentG = currentG * (1 - opacity) + targetG * opacity;
        currentB = currentB * (1 - opacity) + targetB * opacity;

        currentA = currentA + (255 - currentA) * opacity;
      }

      processed[idx] = currentR;
      processed[idx + 1] = currentG;
      processed[idx + 2] = currentB;
      processed[idx + 3] = currentA;

      // Apply error diffusion matrix
      for (let dy = 0; dy < matrix.length; dy++) {
        for (let dx = 0; dx < matrix[dy].length; dx++) {
          const coefficient = matrix[dy][dx];
          if (coefficient === 0) continue;

          const newX = x + dx - Math.floor(matrix[0].length / 2);
          const newY = y + dy;

          if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
            const newI = newY * width + newX;
            const errorAmount = (error * coefficient) / divisor;
            grayData[newI] += errorAmount;
          }
        }
      }
    }
  }

  return processedData;
};

// Additional dithering algorithms
export const jarvisJudiceNinkeDither = (imageData: ImageData, layers: LayerConfig[], previewScaleRatio: number): ImageData => {
  return applyErrorDiffusion(imageData, layers, [
    [0, 0, 7, 5],
    [3, 5, 7, 5, 3],
    [1, 3, 5, 3, 1]
  ], 48, previewScaleRatio);
};

export const sierraDither = (imageData: ImageData, layers: LayerConfig[], previewScaleRatio: number): ImageData => {
  return applyErrorDiffusion(imageData, layers, [
    [0, 0, 5, 3],
    [2, 4, 5, 4, 2],
    [0, 2, 3, 2, 0]
  ], 32, previewScaleRatio);
};

export const burkesDither = (imageData: ImageData, layers: LayerConfig[], previewScaleRatio: number): ImageData => {
  return applyErrorDiffusion(imageData, layers, [
    [0, 0, 8, 4],
    [2, 4, 8, 4, 2]
  ], 32, previewScaleRatio);
};

export const stuckiDither = (imageData: ImageData, layers: LayerConfig[], previewScaleRatio: number): ImageData => {
  return applyErrorDiffusion(imageData, layers, [
    [0, 0, 8, 4],
    [2, 4, 8, 4, 2],
    [1, 2, 4, 2, 1]
  ], 42, previewScaleRatio);
};

// Riemersma Dithering - Space-filling curve based dithering
export const riemersmaDither = (imageData: ImageData, layers: LayerConfig[], previewScaleRatio: number): ImageData => {
  const data = new Uint8ClampedArray(imageData.data);
  const width = imageData.width;
  const height = imageData.height;
  const backgroundLayer = layers[layers.length - 1];
  const thresholdLayers = layers.slice(0, layers.length - 1).filter(layer => layer.visible !== false);

  // Create error buffer for Riemersma curve
  const errorBuffer: number[] = new Array(Math.min(width, height)).fill(0);
  const bufferSize = errorBuffer.length;
  let bufferIndex = 0;

  // Generate Hilbert curve coordinates for space-filling traversal
  const hilbertCoords: Array<[number, number]> = [];

  // Simple recursive Hilbert curve generator
  const generateHilbert = (n: number, x: number, y: number, xi: number, xj: number, yi: number, yj: number) => {
    if (n <= 0) {
      const coordX = Math.floor(x + (xi + yi) / 2);
      const coordY = Math.floor(y + (xj + yj) / 2);
      if (coordX >= 0 && coordX < width && coordY >= 0 && coordY < height) {
        hilbertCoords.push([coordX, coordY]);
      }
    } else {
      generateHilbert(n - 1, x, y, yi / 2, yj / 2, xi / 2, xj / 2);
      generateHilbert(n - 1, x + xi / 2, y + xj / 2, xi / 2, xj / 2, yi / 2, yj / 2);
      generateHilbert(n - 1, x + xi / 2 + yi / 2, y + xj / 2 + yj / 2, xi / 2, xj / 2, yi / 2, yj / 2);
      generateHilbert(n - 1, x + xi / 2 + yi, y + xj / 2 + yj, -yi / 2, -yj / 2, -xi / 2, -xj / 2);
    }
  };

  // Calculate appropriate order for the image size
  const order = Math.max(1, Math.floor(Math.log2(Math.max(width, height))));
  const size = Math.pow(2, order);

  generateHilbert(order, 0, 0, size, 0, 0, size);

  // If we don't have enough coordinates, fall back to raster scan
  if (hilbertCoords.length < width * height * 0.5) {
    hilbertCoords.length = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        hilbertCoords.push([x, y]);
      }
    }
  }

  // Process pixels along the space-filling curve
  for (const [x, y] of hilbertCoords) {
    if (x >= width || y >= height) continue;

    const idx = (y * width + x) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];

    const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);

    // Add accumulated error from buffer
    const adjustedGray = Math.max(0, Math.min(255, gray + errorBuffer[bufferIndex]));

    let selectedLayer = backgroundLayer;
    for (const layer of thresholdLayers) {
      if (adjustedGray <= (layer.threshold || 255)) {
        selectedLayer = layer;
        break;
      }
    }

    const quantizedValue = selectedLayer.threshold || 128;
    const error = adjustedGray - quantizedValue;

    // Start with transparent base
    let currentR = 0;
    let currentG = 0;
    let currentB = 0;
    let currentA = 0;

    if (backgroundLayer.visible !== false) {
      [currentR, currentG, currentB] = applyLayerWithPattern(
        x, y, gray,
        { ...backgroundLayer, opacity: 100, blendMode: 'normal' },
        0, 0, 0,
        previewScaleRatio
      );
      currentA = (backgroundLayer.opacity / 100) * 255;
    }

    if (selectedLayer !== backgroundLayer && selectedLayer.visible !== false) {
      const [targetR, targetG, targetB] = applyLayerWithPattern(
        x, y, gray,
        { ...selectedLayer, opacity: 100 },
        currentR, currentG, currentB,
        previewScaleRatio
      );

      const opacity = selectedLayer.opacity / 100;

      currentR = currentR * (1 - opacity) + targetR * opacity;
      currentG = currentG * (1 - opacity) + targetG * opacity;
      currentB = currentB * (1 - opacity) + targetB * opacity;

      currentA = currentA + (255 - currentA) * opacity;
    }

    data[idx] = currentR;
    data[idx + 1] = currentG;
    data[idx + 2] = currentB;
    data[idx + 3] = currentA;

    // Distribute error along the curve with exponential decay
    errorBuffer[bufferIndex] = 0;

    for (let i = 1; i < bufferSize && i < 16; i++) {
      const bufferPos = (bufferIndex + i) % bufferSize;
      const weight = Math.exp(-i / 4); // Exponential decay
      errorBuffer[bufferPos] += error * weight / 4;
    }

    bufferIndex = (bufferIndex + 1) % bufferSize;
  }

  return new ImageData(data, width, height);
};

export const falseFloydSteinbergDither = (imageData: ImageData, layers: LayerConfig[], previewScaleRatio: number): ImageData => {
  return applyErrorDiffusion(imageData, layers, [
    [0, 3],
    [3, 2]
  ], 8, previewScaleRatio);
};

export const sierraLiteDither = (imageData: ImageData, layers: LayerConfig[], previewScaleRatio: number): ImageData => {
  return applyErrorDiffusion(imageData, layers, [
    [0, 0, 2],
    [1, 1]
  ], 4, previewScaleRatio);
};