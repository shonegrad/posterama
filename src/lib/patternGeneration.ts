// Cached rotation values for performance
const rotationCache = new Map<number, { cos: number, sin: number }>();

const getRotationValues = (angleDegrees: number) => {
  if (angleDegrees === 0) return { cos: 1, sin: 0 };

  const rounded = Math.round(angleDegrees);
  if (rotationCache.has(rounded)) {
    return rotationCache.get(rounded)!;
  }

  const angleRad = (rounded * Math.PI) / 180;
  const values = { cos: Math.cos(angleRad), sin: Math.sin(angleRad) };
  rotationCache.set(rounded, values);
  return values;
};

// Optimized rotation helper
const rotatePoint = (x: number, y: number, centerX: number, centerY: number, angleDegrees: number): [number, number] => {
  if (angleDegrees === 0) return [x, y];

  const { cos, sin } = getRotationValues(angleDegrees);

  const dx = x - centerX;
  const dy = y - centerY;

  const rotatedX = centerX + (dx * cos - dy * sin);
  const rotatedY = centerY + (dx * sin + dy * cos);

  return [rotatedX, rotatedY];
};

// Optimized rotation for infinite tiling patterns
const rotateCoordinates = (x: number, y: number, angleDegrees: number): [number, number] => {
  if (angleDegrees === 0) return [x, y];

  const { cos, sin } = getRotationValues(angleDegrees);

  const rotatedX = x * cos - y * sin;
  const rotatedY = x * sin + y * cos;

  return [rotatedX, rotatedY];
};

// Safe Modulo helper to handle negative numbers correctly for infinite tiling
const safeMod = (n: number, m: number) => ((n % m) + m) % m;

// Pattern generation functions with Independent Size and Spacing

export const generateHalftonePattern = (
  x: number,
  y: number,
  gray: number,
  patternSize: number,
  patternRotation: number,
  fgR: number,
  fgG: number,
  fgB: number,
  bgR: number,
  bgG: number,
  bgB: number,
  previewScaleRatio: number,
  patternSpacing: number = 0
): [number, number, number] => {
  const scaledSize = patternSize * previewScaleRatio;
  const scaledSpacing = patternSpacing * previewScaleRatio;
  const period = Math.max(2, scaledSize + scaledSpacing);

  const cellX = Math.floor(x / period);
  const cellY = Math.floor(y / period);
  const centerX = cellX * period + period / 2;
  const centerY = cellY * period + period / 2;

  let px = x, py = y;
  if (Math.abs(patternRotation) > 1) {
    [px, py] = rotatePoint(x, y, centerX, centerY, -patternRotation);
  }

  const distanceSq = (px - centerX) ** 2 + (py - centerY) ** 2;

  const maxRadius = scaledSize / 2;
  const maxRadiusSq = maxRadius ** 2;

  const dotRadiusSq = maxRadiusSq * ((255 - gray) / 255) ** 2;

  const useForeground = distanceSq <= dotRadiusSq;

  return useForeground ? [fgR, fgG, fgB] : [bgR, bgG, bgB];
};

export const generateScreentonePattern = (
  x: number,
  y: number,
  gray: number,
  patternSize: number,
  patternRotation: number,
  fgR: number,
  fgG: number,
  fgB: number,
  bgR: number,
  bgG: number,
  bgB: number,
  previewScaleRatio: number,
  patternSpacing: number = 0
): [number, number, number] => {
  const scaledSize = patternSize * previewScaleRatio;
  const scaledSpacing = patternSpacing * previewScaleRatio;
  const period = Math.max(2, scaledSize + scaledSpacing);

  const [rotatedX, rotatedY] = rotateCoordinates(x, y, -patternRotation);

  const density = 1 - (gray / 255);
  const maxLineWidth = scaledSize;
  const lineWidth = maxLineWidth * density;

  const periodParams = safeMod(rotatedY, period);
  const normalizedPos = periodParams; // safeMod guarantees positive

  const center = period / 2;
  const dist = Math.abs(normalizedPos - center);

  const useForeground = dist < (lineWidth / 2);

  return useForeground ? [fgR, fgG, fgB] : [bgR, bgG, bgB];
};

export const generateNoisePattern = (
  x: number,
  y: number,
  gray: number,
  patternSize: number,
  patternRotation: number,
  fgR: number,
  fgG: number,
  fgB: number,
  bgR: number,
  bgG: number,
  bgB: number,
  patternSpacing: number = 0
): [number, number, number] => {
  const seed = x * 73 + y * 37 + gray;
  const random = ((seed * 9301 + 49297) % 233280) / 233280;

  const densityFactor = Math.max(0, 1 - (patternSpacing / 20));

  const threshold = 1 - (gray / 255) * 0.8 * densityFactor;
  const useForeground = random > threshold;

  return useForeground ? [fgR, fgG, fgB] : [bgR, bgG, bgB];
};

export const generateCrosshatchPattern = (
  x: number,
  y: number,
  gray: number,
  patternSize: number,
  patternRotation: number,
  fgR: number,
  fgG: number,
  fgB: number,
  bgR: number,
  bgG: number,
  bgB: number,
  previewScaleRatio: number,
  patternSpacing: number = 0
): [number, number, number] => {
  const scaledSize = patternSize * previewScaleRatio;
  const scaledSpacing = patternSpacing * previewScaleRatio;

  // Period = Size + Spacing
  const period = Math.max(2, scaledSize + scaledSpacing * 2);
  const density = 1 - gray / 255;

  const [rotatedX, rotatedY] = rotateCoordinates(x, y, -patternRotation);

  const baseLineWidth = Math.max(1, period / 20);
  const lineWidth = baseLineWidth;

  const horizontalLine = safeMod(rotatedY, period) < lineWidth;
  const verticalLine = safeMod(rotatedX, period) < lineWidth;
  const diagonalLine1 = safeMod(rotatedX + rotatedY, period) < lineWidth;
  const diagonalLine2 = safeMod(rotatedX - rotatedY, period) < lineWidth;

  let useForeground = false;
  if (lineWidth > 0) {
    if (density > 0.75) useForeground = horizontalLine || verticalLine || diagonalLine1 || diagonalLine2;
    else if (density > 0.5) useForeground = horizontalLine || verticalLine || diagonalLine1;
    else if (density > 0.25) useForeground = horizontalLine || verticalLine;
    else useForeground = horizontalLine;
  }

  return useForeground ? [fgR, fgG, fgB] : [bgR, bgG, bgB];
};

export const generateStipplingPattern = (
  x: number,
  y: number,
  gray: number,
  patternSize: number,
  patternRotation: number,
  fgR: number,
  fgG: number,
  fgB: number,
  bgR: number,
  bgG: number,
  bgB: number,
  patternSpacing: number = 0
): [number, number, number] => {
  const seed = x * 127 + y * 83;
  const random = ((seed * 16807) % 2147483647) / 2147483647;

  const densityFactor = Math.max(0, 1 - (patternSpacing / 20));
  const density = (1 - gray / 255) * 0.6 * densityFactor;

  const useForeground = random < density;
  return useForeground ? [fgR, fgG, fgB] : [bgR, bgG, bgB];
};

export const generateNewspaperPattern = (
  x: number,
  y: number,
  gray: number,
  patternSize: number,
  patternRotation: number,
  fgR: number,
  fgG: number,
  fgB: number,
  bgR: number,
  bgG: number,
  bgB: number,
  previewScaleRatio: number,
  patternSpacing: number = 0
): [number, number, number] => {
  const scaledSize = patternSize * previewScaleRatio;
  const scaledSpacing = patternSpacing * previewScaleRatio;
  const period = Math.max(2, scaledSize + scaledSpacing);

  const [rotatedX, rotatedY] = rotateCoordinates(x, y, -patternRotation);

  const cellX = Math.floor(rotatedX / period);
  const cellY = Math.floor(rotatedY / period);
  const localX = rotatedX - cellX * period;
  const localY = rotatedY - cellY * period;

  const centerX = period / 2;
  const centerY = period / 2;
  const distance = Math.sqrt((localX - centerX) ** 2 + (localY - centerY) ** 2);

  const seed = Math.abs(cellX * 41 + cellY * 23);
  const random = ((seed * 12345) % 100) / 100;

  const maxRadius = scaledSize / 2;
  const dotRadius = maxRadius * (1 - gray / 255) * (0.8 + random * 0.4);

  const useForeground = distance <= dotRadius;
  return useForeground ? [fgR, fgG, fgB] : [bgR, bgG, bgB];
};

export const generateDotsPattern = (
  x: number,
  y: number,
  patternSize: number,
  patternRotation: number,
  fgR: number,
  fgG: number,
  fgB: number,
  bgR: number,
  bgG: number,
  bgB: number,
  previewScaleRatio: number,
  patternSpacing: number = 0
): [number, number, number] => {
  const scaledSize = patternSize * previewScaleRatio;
  const scaledSpacing = patternSpacing * previewScaleRatio;
  const period = Math.max(2, scaledSize + scaledSpacing);

  const [rotatedX, rotatedY] = rotateCoordinates(x, y, -patternRotation);

  const cellX = Math.floor(rotatedX / period);
  const cellY = Math.floor(rotatedY / period);
  const localX = rotatedX - cellX * period;
  const localY = rotatedY - cellY * period;

  const centerX = period / 2;
  const centerY = period / 2;
  const distance = Math.sqrt((localX - centerX) ** 2 + (localY - centerY) ** 2);

  const radius = scaledSize / 2;

  const useForeground = distance <= radius;
  return useForeground ? [fgR, fgG, fgB] : [bgR, bgG, bgB];
};

export const generateLinesPattern = (
  x: number,
  y: number,
  patternSize: number,
  patternRotation: number,
  fgR: number,
  fgG: number,
  fgB: number,
  bgR: number,
  bgG: number,
  bgB: number,
  previewScaleRatio: number,
  patternSpacing: number = 0
): [number, number, number] => {
  const scaledSize = patternSize * previewScaleRatio;
  const scaledSpacing = patternSpacing * previewScaleRatio;
  const period = Math.max(2, scaledSize + scaledSpacing);

  const [rotatedX, rotatedY] = rotateCoordinates(x, y, -patternRotation);

  const lineWidth = scaledSize;

  // Use safeMod to handle negative coordinates (rotation) correctly
  const horizontalLine = safeMod(rotatedY, period) < lineWidth;
  const verticalLine = safeMod(rotatedX, period) < lineWidth;

  const useForeground = horizontalLine || verticalLine;
  return useForeground ? [fgR, fgG, fgB] : [bgR, bgG, bgB];
};

export const generateWavesPattern = (
  x: number,
  y: number,
  patternSize: number,
  patternRotation: number,
  fgR: number,
  fgG: number,
  fgB: number,
  bgR: number,
  bgG: number,
  bgB: number,
  previewScaleRatio: number,
  patternSpacing: number = 0
): [number, number, number] => {
  const scaledSize = patternSize * previewScaleRatio;
  const scaledSpacing = patternSpacing * previewScaleRatio;
  const period = Math.max(2, scaledSize + scaledSpacing * 5);

  const [rotatedX, rotatedY] = rotateCoordinates(x, y, -patternRotation);

  const waveFreq = (2 * Math.PI) / period;
  const wave = Math.sin(rotatedX * waveFreq) * (period / 6);
  const thickness = Math.max(1, scaledSize);

  // Center threshold around 0?
  const threshold = safeMod(rotatedY, period) - period / 2;

  const useForeground = Math.abs(threshold - wave) < thickness / 2;

  return useForeground ? [fgR, fgG, fgB] : [bgR, bgG, bgB];
};

export const generateHexagonPattern = (
  x: number,
  y: number,
  patternSize: number,
  patternRotation: number,
  fgR: number,
  fgG: number,
  fgB: number,
  bgR: number,
  bgG: number,
  bgB: number,
  previewScaleRatio: number,
  patternSpacing: number = 0
): [number, number, number] => {
  const scaledSize = patternSize * previewScaleRatio;
  const scaledSpacing = patternSpacing * previewScaleRatio;

  const radius = scaledSize / 2;
  const period = (radius * 2) + scaledSpacing;

  const [rotatedX, rotatedY] = rotateCoordinates(x, y, -patternRotation);

  const hexWidth = period;
  const hexHeight = period * 0.866;

  const col = Math.floor(rotatedX / (hexWidth * 0.75));
  // Row needs proper handling for negative?
  // Math.floor handles negative correctly (-1.5 -> -2). 
  // Mod logic inside calculation might be tricky.
  const colPhase = safeMod(col, 2);

  const row = Math.floor((rotatedY - colPhase * hexHeight * 0.5) / hexHeight);

  const localX = rotatedX - col * hexWidth * 0.75;
  const localY = rotatedY - row * hexHeight - colPhase * hexHeight * 0.5;

  const centerX = hexWidth * 0.375;
  const centerY = hexHeight * 0.5;
  const distance = Math.sqrt((localX - centerX) ** 2 + (localY - centerY) ** 2);

  const useForeground = distance <= radius;
  return useForeground ? [fgR, fgG, fgB] : [bgR, bgG, bgB];
};

export const generateBrickPattern = (
  x: number,
  y: number,
  patternSize: number,
  patternRotation: number,
  fgR: number,
  fgG: number,
  fgB: number,
  bgR: number,
  bgG: number,
  bgB: number,
  previewScaleRatio: number,
  patternSpacing: number = 0
): [number, number, number] => {
  const scaledSize = patternSize * previewScaleRatio;
  const scaledSpacing = patternSpacing * previewScaleRatio;

  const brickHeight = scaledSize;
  const brickWidth = scaledSize * 2;
  const mortarWidth = Math.max(1, scaledSpacing);

  const periodH = brickHeight + mortarWidth;
  const periodW = brickWidth + mortarWidth;

  const [rotatedX, rotatedY] = rotateCoordinates(x, y, -patternRotation);

  const row = Math.floor(rotatedY / periodH);
  const rowPhase = safeMod(row, 2);

  // Use safeMod for wrapping
  const localX = safeMod(rotatedX + rowPhase * (periodW / 2), periodW);
  const localY = safeMod(rotatedY, periodH);

  const isMortar = localX < mortarWidth || localY < mortarWidth;
  // Since modulo is safe 0..period, this logic is correct.

  return !isMortar ? [fgR, fgG, fgB] : [bgR, bgG, bgB];
};

export const generateFabricPattern = (
  x: number,
  y: number,
  patternSize: number,
  patternRotation: number,
  fgR: number,
  fgG: number,
  fgB: number,
  bgR: number,
  bgG: number,
  bgB: number,
  previewScaleRatio: number,
  patternSpacing: number = 0
): [number, number, number] => {
  const scaledSize = patternSize * previewScaleRatio;
  const scaledSpacing = patternSpacing * previewScaleRatio;

  const period = scaledSize + scaledSpacing;

  const [rotatedX, rotatedY] = rotateCoordinates(x, y, -patternRotation);

  const cellX = Math.floor(rotatedX / period);
  const cellY = Math.floor(rotatedY / period);

  // Phase needs safe mod
  const warpPhase = safeMod(cellX, 2);
  const weftPhase = safeMod(cellY, 2);

  let useForeground = (warpPhase === weftPhase);

  if (useForeground && scaledSpacing > 0) {
    const localX = rotatedX - cellX * period;
    const localY = rotatedY - cellY * period;

    const threadStart = scaledSpacing / 2;
    const threadEnd = threadStart + scaledSize;

    if (localX < threadStart || localX > threadEnd || localY < threadStart || localY > threadEnd) {
      useForeground = false;
    }
  }

  return useForeground ? [fgR, fgG, fgB] : [bgR, bgG, bgB];
};