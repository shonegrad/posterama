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

function isPresetLike(entry: unknown): entry is UserPreset {
    if (!entry || typeof entry !== 'object') return false;
    const e = entry as Record<string, unknown>;
    return typeof e.id === 'string' && typeof e.name === 'string' && Array.isArray(e.layers);
}

function loadPresetsFromStorage(): UserPreset[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];
        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) return [];
        // Drop malformed entries from older/corrupted data
        return parsed.filter(isPresetLike);
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

    const renamePreset = useCallback((id: string, newName: string): void => {
        setPresets(prev => prev.map(p =>
            p.id === id ? { ...p, name: newName.trim() } : p
        ));
    }, []);

    const deletePreset = useCallback((id: string): void => {
        setPresets(prev => prev.filter(p => p.id !== id));
    }, []);

    const deleteAllPresets = useCallback((): void => {
        setPresets([]);
    }, []);

    /**
     * Imports presets from arbitrary (unparsed JSON) data. Invalid entries and
     * name collisions (with existing or already-imported presets) are skipped.
     * Returns the number of presets actually imported.
     */
    const importPresets = useCallback((data: unknown): number => {
        if (!Array.isArray(data)) return 0;

        const taken = new Set(presets.map(p => p.name.toLowerCase()));
        const imported: UserPreset[] = [];

        for (const entry of data) {
            if (!isPresetLike(entry)) continue;
            const name = entry.name.trim().slice(0, MAX_PRESET_NAME_LENGTH);
            if (!name) continue;
            const key = name.toLowerCase();
            if (taken.has(key)) continue;
            taken.add(key);
            imported.push({
                id: entry.id || crypto.randomUUID(),
                name,
                layers: structuredClone(entry.layers),
                createdAt: typeof entry.createdAt === 'number' ? entry.createdAt : Date.now(),
            });
        }

        if (imported.length > 0) {
            setPresets(prev => [...prev, ...imported]);
        }
        return imported.length;
    }, [presets]);

    const hasPresetWithName = useCallback((name: string): boolean => {
        return presets.some(p => p.name.toLowerCase() === name.trim().toLowerCase());
    }, [presets]);

    return {
        presets,
        savePreset,
        loadPreset,
        renamePreset,
        deletePreset,
        deleteAllPresets,
        importPresets,
        hasPresetWithName,
    };
}
