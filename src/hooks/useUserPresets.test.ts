import { beforeEach, describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUserPresets } from './useUserPresets';
import { DEFAULT_LAYERS, LayerConfig } from '../lib/constants';

const STORAGE_KEY = 'posterama-user-presets';

describe('useUserPresets', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('saves a preset with a unique id and name', () => {
        const { result } = renderHook(() => useUserPresets());

        act(() => {
            result.current.savePreset('My Preset', DEFAULT_LAYERS);
        });

        expect(result.current.presets).toHaveLength(1);
        expect(result.current.presets[0].name).toBe('My Preset');
        expect(result.current.presets[0].id).toBeTruthy();
        expect(result.current.presets[0].layers).toEqual(DEFAULT_LAYERS);
    });

    it('is case-insensitive on duplicate names', () => {
        const { result } = renderHook(() => useUserPresets());

        act(() => {
            result.current.savePreset('Poster', DEFAULT_LAYERS);
        });

        expect(result.current.hasPresetWithName('poster')).toBe(true);
        expect(result.current.hasPresetWithName('POSTER')).toBe(true);
        expect(result.current.hasPresetWithName('different')).toBe(false);
    });

    it('returns a deep clone on load so layers can drift safely', () => {
        const layers: LayerConfig[] = structuredClone(DEFAULT_LAYERS);
        const { result } = renderHook(() => useUserPresets());

        act(() => {
            result.current.savePreset('Clone', layers);
        });

        const presetId = result.current.presets[0].id;
        const loaded = result.current.loadPreset(presetId);

        expect(loaded).toEqual(DEFAULT_LAYERS);
        expect(loaded).not.toBe(layers);

        if (loaded) {
            loaded[0].color = '#ff0000';
        }
        expect(result.current.presets[0].layers[0].color).not.toBe('#ff0000');
    });

    it('returns null when loading an unknown preset id', () => {
        const { result } = renderHook(() => useUserPresets());
        expect(result.current.loadPreset('does-not-exist')).toBeNull();
    });

    it('deletes presets', () => {
        const { result } = renderHook(() => useUserPresets());

        act(() => {
            result.current.savePreset('Doomed', DEFAULT_LAYERS);
        });
        const presetId = result.current.presets[0].id;

        act(() => {
            result.current.deletePreset(presetId);
        });

        expect(result.current.presets).toHaveLength(0);
    });

    it('persists presets to localStorage and restores them', () => {
        const first = renderHook(() => useUserPresets());

        act(() => {
            first.result.current.savePreset('Persistent', DEFAULT_LAYERS);
        });

        const stored = localStorage.getItem(STORAGE_KEY);
        expect(stored).not.toBeNull();
        expect(JSON.parse(stored ?? '[]')).toHaveLength(1);

        const second = renderHook(() => useUserPresets());
        expect(second.result.current.presets).toHaveLength(1);
        expect(second.result.current.presets[0].name).toBe('Persistent');
    });

    it('ignores malformed persisted data instead of crashing', () => {
        localStorage.setItem(STORAGE_KEY, 'not-json-at-all');
        const { result } = renderHook(() => useUserPresets());
        expect(result.current.presets).toEqual([]);
    });
});
