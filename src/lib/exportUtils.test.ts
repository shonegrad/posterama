import { describe, it, expect } from 'vitest';
import { stripExtension, resolveExportScale } from './exportUtils';

describe('stripExtension', () => {
    it('removes a trailing extension', () => {
        expect(stripExtension('poster.png')).toBe('poster');
        expect(stripExtension('my.photo.jpg')).toBe('my.photo');
    });

    it('keeps names without extensions or leading dots', () => {
        expect(stripExtension('poster')).toBe('poster');
        expect(stripExtension('.hidden')).toBe('.hidden');
    });

    it('handles empty input', () => {
        expect(stripExtension('')).toBe('');
    });
});

describe('resolveExportScale', () => {
    it('parses preset scale values', () => {
        expect(resolveExportScale('0.5', 2)).toBe(0.5);
        expect(resolveExportScale('1', 2)).toBe(1);
    });

    it('uses the custom value for the "custom" option', () => {
        expect(resolveExportScale('custom', 3.5)).toBe(3.5);
    });

    it('falls back to 1 for invalid or non-positive values', () => {
        expect(resolveExportScale('not-a-number', 1)).toBe(1);
        expect(resolveExportScale('custom', NaN)).toBe(1);
        expect(resolveExportScale('custom', 0)).toBe(1);
        expect(resolveExportScale('custom', -2)).toBe(1);
    });
});
