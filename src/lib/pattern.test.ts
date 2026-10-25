import { renderHook, act } from '@testing-library/react';
import { useUserPresets } from '../hooks/useUserPresets';
import { DEFAULT_LAYERS } from '../lib/constants';

const STORAGE_KEY = 'posterama-user-presets';

describe('useUserPresets - pattern integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('preset save includes pattern fields in layers', () => {
    const { result } = renderHook(() => useUserPresets());

    act(() => {
      const layersWithPattern: any = structuredClone(DEFAULT_LAYERS);
      layersWithPattern[0].pattern = 'halftone';
      layersWithPattern[0].usePattern = true;
      result.current.savePreset('PatternTest', layersWithPattern);
    });

    // Pattern is stored per-layer via structuredClone
    expect(result.current.presets[0].layers[0].pattern).toBe('halftone');
    expect(result.current.presets[0].layers[0].usePattern).toBe(true);
  });

  it('preset load returns layers matching saved pattern', () => {
    const layersWithPattern: any = structuredClone(DEFAULT_LAYERS);
    layersWithPattern[0].pattern = 'screentone';
    layersWithPattern[0].usePattern = true;

    const first = renderHook(() => useUserPresets());
    act(() => {
      first.result.current.savePreset('PatternTest', layersWithPattern);
    });

    const loaded = first.result.current.loadPreset(first.result.current.presets[0].id);
    // loaded should be the layer config (deep cloned)
    expect(loaded).toBeTruthy();
    if (loaded) {
      expect(loaded[0].pattern).toBe('screentone');
      expect(loaded[0].usePattern).toBe(true);
    }
  });
});