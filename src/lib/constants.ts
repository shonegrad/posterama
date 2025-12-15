export interface LayerConfig {
  threshold?: number; // Background layer won't have threshold
  color: string;
  opacity: number;
  usePattern?: boolean; // Toggle between color (default) and pattern fill
  pattern: 'none' | 'halftone' | 'screentone' | 'noise' | 'crosshatch' | 'stippling' | 'newspaper' | 'dots' | 'lines' | 'waves' | 'hexagon' | 'brick' | 'fabric';
  patternSize: number;
  patternSpacing?: number; // Space between pattern elements (0-50, default 0)
  patternRotation: number; // Pattern rotation in degrees (0-360)
  patternForegroundColor: string; // Pattern foreground color
  patternBackgroundColor: string; // Pattern background color
  blendMode: 'normal' | 'multiply' | 'screen' | 'overlay' | 'soft-light' | 'hard-light' | 'color-dodge' | 'color-burn' | 'darken' | 'lighten' | 'difference' | 'exclusion';
  collapsed?: boolean; // For collapsible layers
  visible?: boolean; // For layer visibility
}

export type ThresholdAlgorithm = 'simple' | 'floyd-steinberg' | 'false-floyd-steinberg' | 'ordered-dither' | 'atkinson' | 'jarvis-judice-ninke' | 'sierra' | 'sierra-lite' | 'burkes' | 'stucki' | 'riemersma';

export interface ColorSwatch {
  color: string;
  percentage: number;
}

export interface ColorPreset {
  name: string;
  layers: LayerConfig[];
}

// Default vivid layer configuration with optimized threshold coverage
// Default vivid layer configuration with optimized threshold coverage
// Thresholds are set to evenly cover the 0-255 tonal range
// Layer 2 (darkest shadows): 0-85, Layer 1 (midtones): 86-170, Background: 171-255
export const DEFAULT_LAYERS: LayerConfig[] = [
  { threshold: 85, color: '#0F172A', opacity: 100, usePattern: false, pattern: 'none', patternSize: 16, patternRotation: 0, patternForegroundColor: '#0F172A', patternBackgroundColor: '#ffffff', blendMode: 'normal', collapsed: false, visible: true },
  { threshold: 170, color: '#1E3A8A', opacity: 100, usePattern: false, pattern: 'none', patternSize: 16, patternRotation: 0, patternForegroundColor: '#1E3A8A', patternBackgroundColor: '#ffffff', blendMode: 'normal', collapsed: false, visible: true },
  { color: '#ffffff', opacity: 100, usePattern: false, pattern: 'none', patternSize: 16, patternRotation: 0, patternForegroundColor: '#000000', patternBackgroundColor: '#ffffff', blendMode: 'normal', collapsed: false, visible: true }
];

export const COLOR_PRESETS: Record<string, ColorPreset> = {
  cyberpunk: {
    name: 'Cyberpunk Neon',
    layers: [
      { threshold: 85, color: '#0D0221', opacity: 100, usePattern: false, pattern: 'none', patternSize: 3, patternRotation: 0, patternForegroundColor: '#1a0440', patternBackgroundColor: '#0D0221', blendMode: 'normal', collapsed: false, visible: true },
      { threshold: 170, color: '#00F0FF', opacity: 90, usePattern: false, pattern: 'none', patternSize: 3, patternRotation: 90, patternForegroundColor: '#00F0FF', patternBackgroundColor: 'transparent', blendMode: 'screen', collapsed: false, visible: true },
      { color: '#FF0090', opacity: 100, usePattern: false, pattern: 'none', patternSize: 4, patternRotation: 45, patternForegroundColor: '#FF0090', patternBackgroundColor: '#ffffff', blendMode: 'screen', collapsed: false, visible: true }
    ]
  },
  glitch: {
    name: 'Glitch Art',
    layers: [
      { threshold: 85, color: '#1a1a1a', opacity: 100, usePattern: false, pattern: 'none', patternSize: 2, patternRotation: 0, patternForegroundColor: '#1a1a1a', patternBackgroundColor: '#000000', blendMode: 'normal', collapsed: false, visible: true },
      { threshold: 170, color: '#00ff00', opacity: 80, usePattern: false, pattern: 'none', patternSize: 10, patternRotation: 0, patternForegroundColor: '#00ff00', patternBackgroundColor: 'transparent', blendMode: 'exclusion', collapsed: false, visible: true },
      { color: '#ff00ff', opacity: 100, usePattern: false, pattern: 'none', patternSize: 4, patternRotation: 90, patternForegroundColor: '#ff00ff', patternBackgroundColor: 'transparent', blendMode: 'difference', collapsed: false, visible: true }
    ]
  },
  acid: {
    name: 'Acid Graphics',
    layers: [
      { threshold: 85, color: '#4b0082', opacity: 100, usePattern: false, pattern: 'none', patternSize: 20, patternRotation: 45, patternForegroundColor: '#4b0082', patternBackgroundColor: '#2e0050', blendMode: 'normal', collapsed: false, visible: true },
      { threshold: 170, color: '#ccff00', opacity: 90, usePattern: false, pattern: 'none', patternSize: 12, patternRotation: 0, patternForegroundColor: '#ccff00', patternBackgroundColor: 'transparent', blendMode: 'hard-light', collapsed: false, visible: true },
      { color: '#ff6600', opacity: 85, usePattern: false, pattern: 'none', patternSize: 8, patternRotation: 0, patternForegroundColor: '#ff6600', patternBackgroundColor: 'transparent', blendMode: 'color-dodge', collapsed: false, visible: true }
    ]
  },
  risograph: {
    name: 'Risograph Print',
    layers: [
      { threshold: 85, color: '#0078BF', opacity: 85, usePattern: false, pattern: 'none', patternSize: 20, patternRotation: 0, patternForegroundColor: '#0078BF', patternBackgroundColor: 'transparent', blendMode: 'multiply', collapsed: false, visible: true },
      { threshold: 170, color: '#FF48B0', opacity: 85, usePattern: false, pattern: 'none', patternSize: 6, patternRotation: 45, patternForegroundColor: '#FF48B0', patternBackgroundColor: 'transparent', blendMode: 'multiply', collapsed: false, visible: true },
      { color: '#FFE800', opacity: 100, usePattern: false, pattern: 'none', patternSize: 4, patternRotation: 0, patternForegroundColor: '#FFE800', patternBackgroundColor: 'transparent', blendMode: 'multiply', collapsed: false, visible: true }
    ]
  },
  gameboy: {
    name: 'Retro Gameboy',
    layers: [
      { threshold: 85, color: '#0F380F', opacity: 100, usePattern: false, pattern: 'none', patternSize: 4, patternRotation: 0, patternForegroundColor: '#0F380F', patternBackgroundColor: '#306230', blendMode: 'normal', collapsed: false, visible: true },
      { threshold: 170, color: '#306230', opacity: 100, usePattern: false, pattern: 'none', patternSize: 8, patternRotation: 0, patternForegroundColor: '#306230', patternBackgroundColor: '#8BAC0F', blendMode: 'normal', collapsed: false, visible: true },
      { color: '#8BAC0F', opacity: 100, usePattern: false, pattern: 'none', patternSize: 4, patternRotation: 0, patternForegroundColor: '#8BAC0F', patternBackgroundColor: '#9BBC0F', blendMode: 'normal', collapsed: false, visible: true }
    ]
  },
  vintageNews: {
    name: 'Vintage Newspaper',
    layers: [
      { threshold: 85, color: '#2F2F2F', opacity: 95, usePattern: false, pattern: 'none', patternSize: 8, patternRotation: 45, patternForegroundColor: '#2F2F2F', patternBackgroundColor: 'transparent', blendMode: 'multiply', collapsed: false, visible: true },
      { threshold: 170, color: '#5A5A5A', opacity: 80, usePattern: false, pattern: 'none', patternSize: 6, patternRotation: 15, patternForegroundColor: '#5A5A5A', patternBackgroundColor: 'transparent', blendMode: 'multiply', collapsed: false, visible: true },
      { color: '#E8E4D9', opacity: 100, usePattern: false, pattern: 'none', patternSize: 4, patternRotation: 0, patternForegroundColor: '#000000', patternBackgroundColor: '#E8E4D9', blendMode: 'normal', collapsed: false, visible: true }
    ]
  },
  blueprint: {
    name: 'Blueprint Tech',
    layers: [
      { threshold: 85, color: '#FFFFFF', opacity: 90, usePattern: false, pattern: 'none', patternSize: 12, patternRotation: 0, patternForegroundColor: '#FFFFFF', patternBackgroundColor: 'transparent', blendMode: 'screen', collapsed: false, visible: true },
      { threshold: 170, color: '#E0E0E0', opacity: 60, usePattern: false, pattern: 'none', patternSize: 12, patternRotation: 90, patternForegroundColor: '#E0E0E0', patternBackgroundColor: 'transparent', blendMode: 'screen', collapsed: false, visible: true },
      { color: '#0052CC', opacity: 100, usePattern: false, pattern: 'none', patternSize: 24, patternRotation: 0, patternForegroundColor: '#0047b3', patternBackgroundColor: '#0052CC', blendMode: 'normal', collapsed: false, visible: true }
    ]
  },
  popart: {
    name: 'Pop Art',
    layers: [
      { threshold: 85, color: '#000000', opacity: 100, usePattern: false, pattern: 'none', patternSize: 6, patternRotation: 45, patternForegroundColor: '#000000', patternBackgroundColor: '#ffffff', blendMode: 'normal', collapsed: false, visible: true },
      { threshold: 170, color: '#E60023', opacity: 100, usePattern: false, pattern: 'none', patternSize: 8, patternRotation: 15, patternForegroundColor: '#E60023', patternBackgroundColor: '#ffffff', blendMode: 'multiply', collapsed: false, visible: true },
      { color: '#FFD700', opacity: 100, usePattern: false, pattern: 'none', patternSize: 4, patternRotation: 0, patternForegroundColor: '#000000', patternBackgroundColor: '#FFD700', blendMode: 'normal', collapsed: false, visible: true }
    ]
  },
  nordic: {
    name: 'Nordic Minimal',
    layers: [
      { threshold: 85, color: '#2C3E50', opacity: 100, usePattern: false, pattern: 'none', patternSize: 4, patternRotation: 0, patternForegroundColor: '#2C3E50', patternBackgroundColor: '#ffffff', blendMode: 'normal', collapsed: false, visible: true },
      { threshold: 170, color: '#34495E', opacity: 100, usePattern: false, pattern: 'none', patternSize: 4, patternRotation: 0, patternForegroundColor: '#34495E', patternBackgroundColor: '#ffffff', blendMode: 'normal', collapsed: false, visible: true },
      { color: '#ECF0F1', opacity: 100, usePattern: false, pattern: 'none', patternSize: 3, patternRotation: 0, patternForegroundColor: '#D0D3D4', patternBackgroundColor: '#ECF0F1', blendMode: 'normal', collapsed: false, visible: true }
    ]
  },
  sepia: {
    name: 'Sepia Grain',
    layers: [
      { threshold: 85, color: '#3D2817', opacity: 90, usePattern: false, pattern: 'none', patternSize: 30, patternRotation: 0, patternForegroundColor: '#3D2817', patternBackgroundColor: 'transparent', blendMode: 'multiply', collapsed: false, visible: true },
      { threshold: 170, color: '#8B4513', opacity: 80, usePattern: false, pattern: 'none', patternSize: 6, patternRotation: 0, patternForegroundColor: '#8B4513', patternBackgroundColor: 'transparent', blendMode: 'multiply', collapsed: false, visible: true },
      { color: '#F5F5DC', opacity: 100, usePattern: false, pattern: 'none', patternSize: 10, patternRotation: 0, patternForegroundColor: '#E0D0C0', patternBackgroundColor: '#F5F5DC', blendMode: 'normal', collapsed: false, visible: true }
    ]
  },
  vaporwave: {
    name: 'Vaporwave',
    layers: [
      { threshold: 85, color: '#6A5ACD', opacity: 100, usePattern: false, pattern: 'none', patternSize: 10, patternRotation: 0, patternForegroundColor: '#6A5ACD', patternBackgroundColor: 'transparent', blendMode: 'normal', collapsed: false, visible: true },
      { threshold: 170, color: '#FF69B4', opacity: 90, usePattern: false, pattern: 'none', patternSize: 4, patternRotation: 0, patternForegroundColor: '#FF69B4', patternBackgroundColor: 'transparent', blendMode: 'screen', collapsed: false, visible: true },
      { color: '#00CED1', opacity: 80, usePattern: false, pattern: 'none', patternSize: 4, patternRotation: 45, patternForegroundColor: '#00CED1', patternBackgroundColor: 'transparent', blendMode: 'normal', collapsed: false, visible: true }
    ]
  },
  synthwave: {
    name: 'Synthwave Grid',
    layers: [
      { threshold: 85, color: '#240046', opacity: 100, usePattern: false, pattern: 'none', patternSize: 8, patternRotation: 0, patternForegroundColor: '#240046', patternBackgroundColor: '#10002b', blendMode: 'normal', collapsed: false, visible: true },
      { threshold: 170, color: '#7b2cbf', opacity: 90, usePattern: false, pattern: 'none', patternSize: 8, patternRotation: 90, patternForegroundColor: '#7b2cbf', patternBackgroundColor: 'transparent', blendMode: 'screen', collapsed: false, visible: true },
      { color: '#e0aaff', opacity: 80, usePattern: false, pattern: 'none', patternSize: 4, patternRotation: 0, patternForegroundColor: '#e0aaff', patternBackgroundColor: 'transparent', blendMode: 'normal', collapsed: false, visible: true }
    ]
  },
  monochrome: {
    name: 'Monochrome Print',
    layers: [
      { threshold: 85, color: '#000000', opacity: 100, usePattern: false, pattern: 'none', patternSize: 6, patternRotation: 0, patternForegroundColor: '#000000', patternBackgroundColor: '#ffffff', blendMode: 'normal', collapsed: false, visible: true },
      { threshold: 170, color: '#404040', opacity: 100, usePattern: false, pattern: 'none', patternSize: 4, patternRotation: 0, patternForegroundColor: '#404040', patternBackgroundColor: '#ffffff', blendMode: 'normal', collapsed: false, visible: true },
      { color: '#f5f5f5', opacity: 100, usePattern: false, pattern: 'none', patternSize: 2, patternRotation: 0, patternForegroundColor: '#d4d4d4', patternBackgroundColor: '#f5f5f5', blendMode: 'normal', collapsed: false, visible: true }
    ]
  }
};

// Algorithm descriptions and optimal settings for better UX
export const ALGORITHM_INFO = {
  'simple': {
    name: 'Simple Threshold',
    description: 'Clean, sharp edges with hard cutoffs',
    optimalThresholds: [25, 102, 179],
    bestFor: 'Icons, graphics, high contrast images'
  },
  'floyd-steinberg': {
    name: 'Floyd-Steinberg',
    description: 'Smooth gradients with error diffusion',
    optimalThresholds: [25, 102, 179],
    bestFor: 'Photographs, portraits, smooth gradients'
  },
  'ordered-dither': {
    name: 'Ordered Dither',
    description: 'Patterned texture with Bayer matrix',
    optimalThresholds: [25, 102, 179],
    bestFor: 'Textures, retro graphics, print media'
  },
  'atkinson': {
    name: 'Atkinson Dither',
    description: 'High contrast dithering, good for text',
    optimalThresholds: [25, 102, 179],
    bestFor: 'Text, line art, high contrast scenes'
  },
  'jarvis-judice-ninke': {
    name: 'Jarvis-Judice-Ninke',
    description: 'Wide error distribution, smooth gradients',
    optimalThresholds: [25, 102, 179],
    bestFor: 'Subtle gradients, soft shadows, portraits'
  },
  'sierra': {
    name: 'Sierra Dither',
    description: 'Balanced error diffusion, natural look',
    optimalThresholds: [25, 102, 179],
    bestFor: 'General purpose, natural images, balanced results'
  },
  'burkes': {
    name: 'Burkes Dither',
    description: 'Minimal error drift, stable results',
    optimalThresholds: [25, 102, 179],
    bestFor: 'Clean images, minimal artifacts, technical drawings'
  },
  'stucki': {
    name: 'Stucki Dither',
    description: 'Sharp details with good tonal range',
    optimalThresholds: [25, 102, 179],
    bestFor: 'Detailed images, sharp edges, wide tonal range'
  },
  'riemersma': {
    name: 'Riemersma Dither',
    description: 'Space-filling curve dither, endless edge quality',
    optimalThresholds: [25, 102, 179],
    bestFor: 'Edge preservation, organic shapes, complex scenes'
  },
  'false-floyd-steinberg': {
    name: 'False Floyd-Steinberg',
    description: 'Reduced error diffusion for higher contrast',
    optimalThresholds: [25, 102, 179],
    bestFor: 'Sharper images, technical diagrams'
  },
  'sierra-lite': {
    name: 'Sierra Lite',
    description: 'Fast, simple error diffusion',
    optimalThresholds: [25, 102, 179],
    bestFor: 'Mobile devices, quick previews'
  }
};

// Performance limits
export const PERFORMANCE_LIMITS = {
  MAX_PATTERN_SIZE: 50,
  MIN_PATTERN_SIZE: 2,
  PROCESSING_CHUNK_SIZE: 1000, // Process in chunks to prevent blocking
  MAX_DEBOUNCE_DELAY: 1000
};

// Recommended threshold presets for different use cases
export const THRESHOLD_PRESETS = {
  // Even distribution - best for general use
  balanced: {
    name: 'Balanced (Recommended)',
    thresholds: [25, 102, 179],
    description: 'Even tonal distribution across all layers'
  },
  // Emphasize shadows
  shadowBias: {
    name: 'Shadow Emphasis',
    thresholds: [45, 115, 195],
    description: 'More detail in dark areas'
  },
  // Emphasize highlights
  highlightBias: {
    name: 'Highlight Emphasis',
    thresholds: [15, 85, 160],
    description: 'More detail in bright areas'
  },
  // High contrast
  highContrast: {
    name: 'High Contrast',
    thresholds: [40, 102, 165],
    description: 'Strong separation between tones'
  },
  // Subtle gradations
  smooth: {
    name: 'Smooth Gradations',
    thresholds: [20, 95, 170],
    description: 'Gentle transitions between layers'
  }
};

// Maximum size for preview optimization - reduced for better performance
export const MAX_PREVIEW_SIZE = 1200; // Increased for better quality default

// Maximum processing size to prevent timeouts
export const MAX_PROCESSING_SIZE = 1200;

// Zoom configuration
export const ZOOM_MIN = 0.1;
export const ZOOM_MAX = 20;
export const ZOOM_STEP = 0.1;

// Legacy zoom levels for backward compatibility or snap points
export const ZOOM_LEVELS = [0.1, 0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4, 6, 8, 12, 16, 20];

// Image scale configuration (for preview and export)
export const IMAGE_SCALE_MIN = 0.1; // 10%
export const IMAGE_SCALE_MAX = 1.0; // 100% (original)
export const IMAGE_SCALE_DEFAULT = 1.0; // Default to original size
export const IMAGE_SCALE_PRESETS = [0.1, 0.25, 0.5, 0.75, 1.0]; // Common scale values