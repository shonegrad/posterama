# Implementation Plan - Hand Tool (Move Image)

## Objective
Finalize and robustify the "Hand Tool" (Move Image) functionality. Ensure it serves as the default interaction mode and provides clear visual feedback to the user.

## Current State Analysis
- **State Management**: `ImageProcessor.tsx` manages `isPanMode` and `panOffset`.
- **Interaction**: Panning currently works implicitly when `isZoomMode` is false, regardless of `isPanMode` state.
- **UI**: `FloatingControls` has a Pan button, but it starts inactive.
- **Shortcuts**: Spacebar temporarily toggles Pan mode (via keydown), but logic might conflict with persistent mode toggles.

## Tasks

### 1. Make Hand Tool Default
- [x] Initialize `isPanMode` to `true` in `ImageProcessor.tsx`.
- [x] Ensure `isZoomMode` and `isPanMode` are mutually exclusive (toggle one disables the other). This logic already exists but verifies it handles the default initialization.

### 2. Enforce Explicit Mode Logic
- [x] Refactor `handlePreviewMouseDown` in `ImageProcessor.tsx`:
    - Only initiate panning If `isPanMode` is active (or if spacebar is held).
    - This prepares the codebase for future tools (e.g., Marquee Selection, Brush) where dragging shouldn't pan.

### 3. Refine Keyboard Shortcuts
- [x] Verify Spacebar behavior:
    - Hold Space -> Switch to temporary Pan Mode (cursor changes to `grab`).
    - Drag while holding Space -> Pan.
    - Release Space -> Return to previous mode.
- [x] Verify Z key behavior:
    - Toggle Zoom Mode.

### 4. Visual Feedback
- [x] Ensure Cursor updates correctly:
    - `isPanMode` (idle) -> `grab`
    - `isPanMode` + `mouseDown` -> `grabbing`
    - `isZoomMode` -> `zoom-in`
    - Alt + `isZoomMode` -> `zoom-out`

### 5. Floating Controls Sync
- [x] Verify `FloatingControls` button highlights correctly when `isPanMode` is active by default. (Replaced with integrated toolbar buttons in PreviewArea).

## Next Steps
- Execute the changes in `ImageProcessor.tsx`.
- Test the interaction manually (Click drag, Spacebar drag, Zoom tool toggle).
