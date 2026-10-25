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

const ALGORITHMS: ThresholdAlgorithm[] = [
    'simple',
    'floyd-steinberg',
    'false-floyd-steinberg',
    'ordered-dither',
    'atkinson',
    'jarvis-judice-ninke',
    'sierra',
    'sierra-lite',
    'burkes',
    'stucki',
    'riemersma'
];

describe('applyAlgorithm', () => {
    it.each(ALGORITHMS)('runs "%s" and preserves image dimensions', (algorithm) => {
        const imageData = makeImageData(8, 8);
        const layers = structuredClone(DEFAULT_LAYERS);

        expect(() => applyAlgorithm(algorithm, imageData, layers, 1)).not.toThrow();

        const result = applyAlgorithm(algorithm, makeImageData(8, 8), layers, 1);
        expect(result.width).toBe(8);
        expect(result.height).toBe(8);
        expect(result.data.length).toBe(8 * 8 * 4);
    });

    it('deterministically maps the same input to the same output', () => {
        const layers = structuredClone(DEFAULT_LAYERS);
        const first = applyAlgorithm('atkinson', makeImageData(8, 8), layers, 1);
        const second = applyAlgorithm('atkinson', makeImageData(8, 8), layers, 1);
        expect(Array.from(second.data)).toEqual(Array.from(first.data));
    });

    it('falls back to layer-based processing for unknown algorithm values', () => {
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
