import { useState, useEffect, useCallback } from 'react';
import { LayerConfig } from '../lib/constants';

export interface UserPreset {
    id: string;
    name: string;
    layers: LayerConfig[];
    createdAt: number;
}

/** Maximum characters a user preset name may have. */
export const MAX_PRESET_NAME_LENGTH = 40;

const STORAGE_KEY = 'posterama-user-presets';

function loadPresetsFromStorage(): UserPreset[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];
        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) return [];
        // Drop malformed entries from older/corrupted data
        return parsed.filter(
            (p) => p && typeof p.id === 'string' && typeof p.name === 'string' && Array.isArray(p.layers)
        );
    } catch {
        return [];
    }
}

function savePresetsToStorage(presets: UserPreset[]): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
    } catch {
        // Storage unavailable or full - presets remain in memory for this session
    }
}

export function useUserPresets() {
    const [presets, setPresets] = useState<UserPreset[]>(() => loadPresetsFromStorage());

    // Sync to localStorage whenever presets change
    useEffect(() => {
        savePresetsToStorage(presets);
    }, [presets]);

    const savePreset = useCallback((name: string, layers: LayerConfig[]): UserPreset => {
        const newPreset: UserPreset = {
            id: crypto.randomUUID(),
            name: name.trim(),
            layers: structuredClone(layers),
            createdAt: Date.now(),
        };
        setPresets(prev => [...prev, newPreset]);
        return newPreset;
    }, []);

    const loadPreset = useCallback((id: string): LayerConfig[] | null => {
        const preset = presets.find(p => p.id === id);
        return preset ? structuredClone(preset.layers) : null;
    }, [presets]);

    const deletePreset = useCallback((id: string): void => {
        setPresets(prev => prev.filter(p => p.id !== id));
    }, []);

    const hasPresetWithName = useCallback((name: string): boolean => {
        return presets.some(p => p.name.toLowerCase() === name.trim().toLowerCase());
    }, [presets]);

    return {
        presets,
        savePreset,
        loadPreset,
        deletePreset,
        hasPresetWithName,
    };
}
