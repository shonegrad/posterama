import { useState, useCallback, useMemo } from 'react';

// Limits the history stack size to prevent memory issues
const MAX_HISTORY_LENGTH = 50;

export interface HistoryState<T> {
    past: T[];
    present: T;
    future: T[];
}

export interface HistoryActions<T> {
    set: (newPresent: T) => void;
    undo: () => void;
    redo: () => void;
    clear: (initialState: T) => void;
    canUndo: boolean;
    canRedo: boolean;
}

export function useHistory<T>(initialPresent: T): [T, HistoryActions<T>] {
    const [state, setState] = useState<HistoryState<T>>({
        past: [],
        present: initialPresent,
        future: []
    });

    const canUndo = state.past.length > 0;
    const canRedo = state.future.length > 0;

    const undo = useCallback(() => {
        setState(currentState => {
            const { past, present, future } = currentState;
            if (past.length === 0) return currentState;

            const previous = past[past.length - 1];
            const newPast = past.slice(0, past.length - 1);

            return {
                past: newPast,
                present: previous,
                future: [present, ...future]
            };
        });
    }, []);

    const redo = useCallback(() => {
        setState(currentState => {
            const { past, present, future } = currentState;
            if (future.length === 0) return currentState;

            const next = future[0];
            const newFuture = future.slice(1);

            return {
                past: [...past, present],
                present: next,
                future: newFuture
            };
        });
    }, []);

    const set = useCallback((newPresent: T) => {
        setState(currentState => {
            const { past, present } = currentState;

            if (newPresent === present) return currentState;

            // Limit history size
            const newPast = [...past, present];
            if (newPast.length > MAX_HISTORY_LENGTH) {
                newPast.shift(); // Remove oldest
            }

            return {
                past: newPast,
                present: newPresent,
                future: [] // Clearing future on new change
            };
        });
    }, []);

    const clear = useCallback((initialState: T) => {
        setState({
            past: [],
            present: initialState,
            future: []
        });
    }, []);

    const actions = useMemo(() => ({
        set,
        undo,
        redo,
        clear,
        canUndo,
        canRedo
    }), [set, undo, redo, clear, canUndo, canRedo]);

    return [state.present, actions];
}
