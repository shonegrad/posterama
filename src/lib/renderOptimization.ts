/**
 * Modern rendering optimization utilities
 * Implements best practices for web performance:
 * - ImageBitmap for efficient decoding
 * - Canvas pooling for memory management
 * - RequestAnimationFrame for smooth updates
 * - Memory cleanup utilities
 */

// Canvas pool for reusing canvas elements
class CanvasPool {
  private pool: HTMLCanvasElement[] = [];
  private maxSize = 5;

  acquire(width: number, height: number): HTMLCanvasElement {
    let canvas = this.pool.pop();

    if (!canvas) {
      canvas = document.createElement('canvas');
    }

    canvas.width = width;
    canvas.height = height;

    return canvas;
  }

  release(canvas: HTMLCanvasElement): void {
    if (this.pool.length < this.maxSize) {
      // Clear the canvas before returning to pool
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      this.pool.push(canvas);
    }
  }

  clear(): void {
    this.pool = [];
  }
}

export const canvasPool = new CanvasPool();

/**
 * Creates an ImageBitmap from an image for efficient rendering
 * ImageBitmap is decoded on a separate thread and optimized for rendering
 */
export async function createOptimizedBitmap(
  image: HTMLImageElement,
  width?: number,
  height?: number
): Promise<ImageBitmap> {
  try {
    const options: ImageBitmapOptions = {
      resizeWidth: width,
      resizeHeight: height,
      resizeQuality: 'pixelated',
      premultiplyAlpha: 'none',
    };

    return await createImageBitmap(image, options);
  } catch (error) {
    console.error('Failed to create ImageBitmap:', error);
    // Fallback: create bitmap without resize
    return await createImageBitmap(image);
  }
}

/**
 * Efficiently extracts ImageData from an image using ImageBitmap
 */
export async function extractImageData(
  image: HTMLImageElement,
  targetWidth?: number,
  targetHeight?: number
): Promise<ImageData> {
  const width = targetWidth || image.width;
  const height = targetHeight || image.height;

  // Use ImageBitmap for efficient decoding
  const bitmap = await createOptimizedBitmap(image, width, height);

  // Get a canvas from the pool
  const canvas = canvasPool.acquire(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d', {
    willReadFrequently: true,
    alpha: false
  });

  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Draw bitmap to canvas
  ctx.drawImage(bitmap, 0, 0);

  // Extract image data
  const imageData = ctx.getImageData(0, 0, bitmap.width, bitmap.height);

  // Clean up
  bitmap.close();
  canvasPool.release(canvas);

  return imageData;
}

/**
 * Renders ImageData to canvas with requestAnimationFrame for smooth updates
 */
export function renderToCanvas(
  canvas: HTMLCanvasElement,
  imageData: ImageData,
  callback?: () => void
): void {
  requestAnimationFrame(() => {
    const ctx = canvas.getContext('2d', {
      alpha: false,
      desynchronized: true // Hint for better performance
    });

    if (!ctx) return;

    // Ensure canvas size matches
    if (canvas.width !== imageData.width || canvas.height !== imageData.height) {
      canvas.width = imageData.width;
      canvas.height = imageData.height;
    }

    ctx.putImageData(imageData, 0, 0);

    if (callback) {
      callback();
    }
  });
}

/**
 * Creates a scaled copy of ImageData more efficiently
 */
export async function scaleImageData(
  imageData: ImageData,
  targetWidth: number,
  targetHeight: number
): Promise<ImageData> {
  // Create temporary canvas for scaling
  const tempCanvas = canvasPool.acquire(imageData.width, imageData.height);
  const tempCtx = tempCanvas.getContext('2d');

  if (!tempCtx) {
    throw new Error('Failed to get temp canvas context');
  }

  tempCtx.putImageData(imageData, 0, 0);

  // Create bitmap from canvas
  const bitmap = await createImageBitmap(tempCanvas, {
    resizeWidth: targetWidth,
    resizeHeight: targetHeight,
    resizeQuality: 'pixelated'
  });

  // Create target canvas
  const targetCanvas = canvasPool.acquire(targetWidth, targetHeight);
  const targetCtx = targetCanvas.getContext('2d');

  if (!targetCtx) {
    bitmap.close();
    throw new Error('Failed to get target canvas context');
  }

  targetCtx.drawImage(bitmap, 0, 0);
  const scaledData = targetCtx.getImageData(0, 0, targetWidth, targetHeight);

  // Cleanup
  bitmap.close();
  canvasPool.release(tempCanvas);
  canvasPool.release(targetCanvas);

  return scaledData;
}

/**
 * Memory cleanup utility
 */
export function cleanupResources(...resources: Array<ImageBitmap | OffscreenCanvas | null | undefined>): void {
  resources.forEach(resource => {
    if (resource) {
      if ('close' in resource) {
        resource.close();
      }
    }
  });
}

/**
 * Debounced processor for handling rapid updates
 */
export class DebouncedProcessor {
  private timeoutId: number | null = null;
  private rafId: number | null = null;

  schedule(callback: () => void, delay: number = 0): void {
    this.cancel();

    if (delay === 0) {
      // Use RAF for immediate updates
      this.rafId = requestAnimationFrame(callback);
    } else {
      // Use timeout for debounced updates
      this.timeoutId = window.setTimeout(callback, delay);
    }
  }

  cancel(): void {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
}

/**
 * Optimized zoom transform calculator
 * Uses CSS transforms instead of re-rendering when possible
 */
export function calculateZoomTransform(
  zoomLevel: number,
  panOffset: { x: number; y: number },
  _containerWidth: number,
  _containerHeight: number,
): {
  scale: number;
  translateX: number;
  translateY: number;
} {
  return {
    scale: zoomLevel,
    translateX: panOffset.x,
    translateY: panOffset.y
  };
}

/**
 * Check if OffscreenCanvas is supported
 */
export function supportsOffscreenCanvas(): boolean {
  return typeof OffscreenCanvas !== 'undefined';
}

/**
 * Check if ImageBitmap is supported
 */
export function supportsImageBitmap(): boolean {
  return typeof createImageBitmap !== 'undefined';
}

/**
 * Performance monitoring utility
 */
export class PerformanceMonitor {
  private marks = new Map<string, number>();

  start(label: string): void {
    this.marks.set(label, performance.now());
  }

  end(label: string): number {
    const start = this.marks.get(label);
    if (start === undefined) {
      console.warn(`No start mark found for: ${label}`);
      return 0;
    }

    const duration = performance.now() - start;
    this.marks.delete(label);

    if (duration > 16.67) { // More than one frame (60fps)
      console.warn(`Slow operation: ${label} took ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  measure(label: string, fn: () => void): number {
    this.start(label);
    fn();
    return this.end(label);
  }

  async measureAsync(label: string, fn: () => Promise<void>): Promise<number> {
    this.start(label);
    await fn();
    return this.end(label);
  }
}

export const perfMonitor = new PerformanceMonitor();
