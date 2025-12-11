import { ColorSwatch, LayerConfig, DEFAULT_LAYERS, MAX_PREVIEW_SIZE, MAX_PROCESSING_SIZE } from './constants';

// Function to create layers with extracted colors
// Function to create layers with extracted colors
export const createLayersWithExtractedColors = (extractedColors: ColorSwatch[]): LayerConfig[] => {
  const baseLayers = JSON.parse(JSON.stringify(DEFAULT_LAYERS));
  const numLayers = baseLayers.length;
  const backgroundIndex = numLayers - 1;

  if (extractedColors.length >= 2) {
    // Sort by lightness (darker first)
    const sortedColors = [...extractedColors]
      .sort((a, b) => {
        const aLightness = parseInt(a.color.substring(1, 3), 16) * 0.299 +
          parseInt(a.color.substring(3, 5), 16) * 0.587 +
          parseInt(a.color.substring(5, 7), 16) * 0.114;
        const bLightness = parseInt(b.color.substring(1, 3), 16) * 0.299 +
          parseInt(b.color.substring(3, 5), 16) * 0.587 +
          parseInt(b.color.substring(5, 7), 16) * 0.114;
        return aLightness - bLightness;
      });

    // The lightest color goes to the background
    const backgroundColor = sortedColors[sortedColors.length - 1].color;

    // Assign background layer
    baseLayers[backgroundIndex].color = backgroundColor;
    baseLayers[backgroundIndex].patternBackgroundColor = backgroundColor; // Typically background doesn't have pattern but for consistency

    // Assign foreground layers
    // We have (numLayers - 1) foreground layers.
    // We want to use the darkest colors for the lowest indices (low thresholds).
    for (let i = 0; i < backgroundIndex; i++) {
      // If we have enough colors, use distinct ones. If not, reuse or clamp.
      // With >= 2 colors, we have at least one foreground and one background.
      // Let's try to map the available dark colors to the layers.

      // Index in sortedColors. We want to skip the last one (used for background).
      // If we have fewer colors than layers, we might reuse some or spread them.
      // Simple strategy: take from the beginning (darkest).

      const colorIndex = Math.min(i, sortedColors.length - 2);
      // Ensure we don't take the background color (length-1) if possible, 
      // but if length is 1?? (checked >=2 above). 
      // If length=2, index 0 is valid. index 1 is background.
      // So max index is length-2.

      const color = sortedColors[colorIndex].color;
      baseLayers[i].color = color;
      baseLayers[i].patternForegroundColor = color;
      baseLayers[i].patternBackgroundColor = backgroundColor;
    }
  }

  return baseLayers;
};

// Rename to reflect it might return ImageBitmap, but for now we keep signature compatible or update it.
// The plan said "Return ImageBitmap instead of HTMLImageElement where possible".
// However, HTMLImageElement is often needed for UI (img src).
// But for processing, ImageBitmap is better.
// The hook uses it for state `previewImage`. If we change `previewImage` type, we update the hook too.
// Let's update the signature to return Promise<{ image: HTMLImageElement | ImageBitmap, scaleRatio: number }>
// and internally use createImageBitmap.

// Actually, `createImageBitmap` returns an ImageBitmap. We can't set that as `src` of an `img` tag directly?
// No, we can put it on a canvas. Or use it in `drawImage`.
// The preview is shown in `PreviewArea`. Let's check `PreviewArea` usage.
// It likely draws to a canvas.

export const resizeImageForPreview = async (originalImg: HTMLImageElement | ImageBitmap, imageScale: number = 1.0): Promise<{ image: ImageBitmap, scaleRatio: number }> => {
  const width = originalImg.width;
  const height = originalImg.height;

  // Apply user-selected scale first
  const scaledWidth = Math.round(width * imageScale);
  const scaledHeight = Math.round(height * imageScale);

  // Then check if it needs further optimization for preview
  if (scaledWidth <= MAX_PREVIEW_SIZE && scaledHeight <= MAX_PREVIEW_SIZE) {
    // If already small enough after user scale, create bitmap at that size
    if (imageScale === 1.0) {
      const bitmap = await createImageBitmap(originalImg);
      return { image: bitmap, scaleRatio: 1.0 };
    } else {
      const bitmap = await createImageBitmap(originalImg, {
        resizeWidth: scaledWidth,
        resizeHeight: scaledHeight,
        resizeQuality: 'high'
      });
      return { image: bitmap, scaleRatio: imageScale };
    }
  }

  try {
    // Apply both user scale and preview optimization
    const previewScale = Math.min(MAX_PREVIEW_SIZE / scaledWidth, MAX_PREVIEW_SIZE / scaledHeight);
    const finalScale = imageScale * previewScale;
    const newWidth = Math.round(width * finalScale);
    const newHeight = Math.round(height * finalScale);

    const bitmap = await createImageBitmap(originalImg, {
      resizeWidth: newWidth,
      resizeHeight: newHeight,
      resizeQuality: 'high'
    });

    return { image: bitmap, scaleRatio: finalScale };
  } catch (err) {
    console.error('Error resizing image:', err);
    // Fallback
    const bitmap = await createImageBitmap(originalImg);
    return { image: bitmap, scaleRatio: 1.0 };
  }
};

// Helper to calculate color distance (Euclidean in RGB)
const colorDistance = (hex1: string, hex2: string): number => {
  const r1 = parseInt(hex1.substring(1, 3), 16);
  const g1 = parseInt(hex1.substring(3, 5), 16);
  const b1 = parseInt(hex1.substring(5, 7), 16);

  const r2 = parseInt(hex2.substring(1, 3), 16);
  const g2 = parseInt(hex2.substring(3, 5), 16);
  const b2 = parseInt(hex2.substring(5, 7), 16);

  return Math.sqrt(
    Math.pow(r2 - r1, 2) +
    Math.pow(g2 - g1, 2) +
    Math.pow(b2 - b1, 2)
  );
};

// Extract image colors for palette
export const extractImageColors = (image: HTMLImageElement): ColorSwatch[] => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  const analysisSize = 100; // Reduced for performance
  canvas.width = analysisSize;
  canvas.height = analysisSize;

  ctx.drawImage(image, 0, 0, analysisSize, analysisSize);
  const imageData = ctx.getImageData(0, 0, analysisSize, analysisSize);
  const data = imageData.data;

  const colorMap = new Map<string, { count: number, saturation: number, lightness: number }>();

  // Sample every 4th pixel for performance
  for (let i = 0; i < data.length; i += 16) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Skip transparent or near-transparent pixels
    if (data[i + 3] < 128) continue;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const lightness = (max + min) / 2 / 255;
    const saturation = max === min ? 0 : lightness > 0.5
      ? (max - min) / (2 - max - min)
      : (max - min) / (max + min);

    // Relaxed filtering to allow more potential colors, but still filter extremes
    if (lightness < 0.05 || lightness > 0.98) continue;

    // Increased quantization step to group similar colors more aggressively
    const quantStep = 24;
    const quantizedR = Math.round(r / quantStep) * quantStep;
    const quantizedG = Math.round(g / quantStep) * quantStep;
    const quantizedB = Math.round(b / quantStep) * quantStep;

    // Clamp to valid 0-255 range
    const curR = Math.min(255, Math.max(0, quantizedR));
    const curG = Math.min(255, Math.max(0, quantizedG));
    const curB = Math.min(255, Math.max(0, quantizedB));

    const hex = `#${curR.toString(16).padStart(2, '0')}${curG.toString(16).padStart(2, '0')}${curB.toString(16).padStart(2, '0')}`;

    if (colorMap.has(hex)) {
      const existing = colorMap.get(hex)!;
      existing.count++;
    } else {
      colorMap.set(hex, { count: 1, saturation, lightness });
    }
  }

  // Clean up canvas
  canvas.width = 1;
  canvas.height = 1;

  // Initial sort by prevalence and saturation
  const candidateColors = Array.from(colorMap.entries())
    .map(([color, data]) => ({
      color,
      score: data.count * (1 + data.saturation * 1.5), // Slightly reduced saturation bias
      count: data.count,
      percentage: 0
    }))
    .sort((a, b) => b.score - a.score);

  // Greedy selection for contrast
  const selectedColors: typeof candidateColors = [];
  const minDistance = 60; // Minimum Euclidean distance between colors

  for (const candidate of candidateColors) {
    if (selectedColors.length >= 8) break;

    let isDistinct = true;
    for (const selected of selectedColors) {
      if (colorDistance(candidate.color, selected.color) < minDistance) {
        isDistinct = false;
        break;
      }
    }

    if (isDistinct) {
      selectedColors.push(candidate);
    }
  }

  // Fallback: If we didn't get enough distinct colors, fill from top candidates regardless of distance
  if (selectedColors.length < 4) {
    for (const candidate of candidateColors) {
      if (selectedColors.length >= 4) break;
      if (!selectedColors.find(c => c.color === candidate.color)) {
        selectedColors.push(candidate);
      }
    }
  }

  const totalScore = selectedColors.reduce((sum, item) => sum + item.score, 0);

  return selectedColors.map(item => ({
    color: item.color,
    percentage: Math.round((item.score / totalScore) * 100)
  }));
};

// Create processing image for zoom levels
export const createProcessingImage = (sourceImage: HTMLImageElement | ImageBitmap, zoomThreshold: number): HTMLImageElement | ImageBitmap => {
  if (zoomThreshold <= 1) {
    return sourceImage;
  }

  // Calculate scale while maintaining aspect ratio
  const scale = Math.min(zoomThreshold, 3);
  const sourceAspectRatio = sourceImage.width / sourceImage.height;

  // Always maintain aspect ratio
  let targetWidth = Math.round(sourceImage.width * scale);
  let targetHeight = Math.round(sourceImage.height * scale);

  // Ensure we don't exceed maximum processing size
  const maxDimension = Math.min(MAX_PROCESSING_SIZE, MAX_PREVIEW_SIZE * scale);
  if (targetWidth > maxDimension || targetHeight > maxDimension) {
    if (targetWidth > targetHeight) {
      targetWidth = maxDimension;
      targetHeight = Math.round(maxDimension / sourceAspectRatio);
    } else {
      targetHeight = maxDimension;
      targetWidth = Math.round(maxDimension * sourceAspectRatio);
    }
  }

  // If dimensions are the same, return original
  if (targetWidth === sourceImage.width && targetHeight === sourceImage.height) {
    return sourceImage;
  }

  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');

  if (!tempCtx) return sourceImage;

  tempCanvas.width = targetWidth;
  tempCanvas.height = targetHeight;

  tempCtx.imageSmoothingEnabled = false;
  tempCtx.drawImage(sourceImage, 0, 0, targetWidth, targetHeight);

  const scaledImage = new Image();
  scaledImage.src = tempCanvas.toDataURL('image/png');

  // Clean up
  tempCanvas.width = 1;
  tempCanvas.height = 1;

  return scaledImage;
};