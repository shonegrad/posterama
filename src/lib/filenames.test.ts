import { describe, it, expect } from 'vitest';
import { buildSmartFilename, getAlgorithmShortName } from './filenames';

describe('getAlgorithmShortName', () => {
    it('maps every algorithm to its short filename suffix', () => {
        expect(getAlgorithmShortName('simple')).toBe('simple');
        expect(getAlgorithmShortName('floyd-steinberg')).toBe('floyd');
        expect(getAlgorithmShortName('false-floyd-steinberg')).toBe('false-floyd');
        expect(getAlgorithmShortName('ordered-dither')).toBe('ordered');
        expect(getAlgorithmShortName('atkinson')).toBe('atkinson');
        expect(getAlgorithmShortName('jarvis-judice-ninke')).toBe('jarvis');
        expect(getAlgorithmShortName('sierra')).toBe('sierra');
        expect(getAlgorithmShortName('sierra-lite')).toBe('sierra-lite');
        expect(getAlgorithmShortName('burkes')).toBe('burkes');
        expect(getAlgorithmShortName('stucki')).toBe('stucki');
        expect(getAlgorithmShortName('riemersma')).toBe('riemersma');
    });
});

describe('buildSmartFilename', () => {
    it('formats `<base>-<algorithm>-<timestamp>`', () => {
        expect(buildSmartFilename('poster', 'atkinson')).toMatch(/^poster-atkinson-\d{6}$/);
        expect(buildSmartFilename('My Photo', 'floyd-steinberg')).toMatch(/^My Photo-floyd-\d{6}$/);
    });

    it('falls back to "image" when the base name is empty', () => {
        expect(buildSmartFilename('', 'sierra')).toMatch(/^image-sierra-\d{6}$/);
        expect(buildSmartFilename('   ', 'burkes')).toMatch(/^image-burkes-\d{6}$/);
    });
});
