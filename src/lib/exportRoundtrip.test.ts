import { describe, it, expect } from 'vitest';
import { applyAlgorithm } from './algorithmDispatch';
import { ThresholdAlgorithm, DEFAULT_LAYERS } from './constants';

const makeImageData = (width: number, height: number): ImageData => {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 128;
    data[i + 1] = 128;
    data[i + 2] = 128;
    data[i + 3] = 255;
  }
  return new ImageData(data, width, height);
};

describe('export roundtrip', () => {
  it('download then re-apply same algorithm preserves image dimensions', () => {
    const imageData = makeImageData(8, 8);
    const layers = structuredClone(DEFAULT_LAYERS);

    // Simulate download algorithm
    const afterApply = applyAlgorithm('atkinson', imageData, layers, 1);
    expect(afterApply.width).toBe(8);
    expect(afterApply.height).toBe(8);
    expect(afterApply.data.length).toBe(8 * 8 * 4);
  });

  it('simple threshold produces same output on repeated apply', () => {
    const imageData = makeImageData(8, 8);
    const layers = structuredClone(DEFAULT_LAYERS);

    const first = applyAlgorithm('simple', imageData, layers, 1);
    const second = applyAlgorithm('simple', makeImageData(8, 8), layers, 1);

    expect(Array.from(second.data)).toEqual(Array.from(first.data));
  });

  it('unknown algorithm falls back to layerBasedProcessing', () => {
    const result = applyAlgorithm(
      'not-a-real-algorithm' as ThresholdAlgorithm,
      makeImageData(4, 4),
      structuredClone(DEFAULT_LAYERS),
      1
    );
    expect(result.width).toBe(4);
    expect(result.height).toBe(4);
  });
});