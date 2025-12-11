# Implementation walkthrough: Transparent Background & Layer Control Updates

## Context
The user requested two main changes:
1.  **Transparent Background:** When the background layer's opacity is reduced or visibility is toggled off, the area behind it should be transparent, not the original image.
2.  **Hide Blend Mode for Background:** The "Blend Mode" selector shouldn't be available for the background layer, as it should always be 'normal'.

## Changes Implemented

### 1. Transparent Background Logic (`src/lib/imageProcessing.ts`)
We refactored all image processing functions (`layerBasedProcessing`, `floydSteinbergDither`, `orderedDither`, `atkinsonDither`, `applyErrorDiffusion`, `riemersmaDither`) to support transparency.

**Previous Logic:**
- Initialized `currentR, currentG, currentB` with the original pixel values.
- Opacity adjustments blended against the original image.

**New Logic:**
- Initialize `currentR, currentG, currentB` to `0` and `currentA` (alpha) to `0`.
- The **Background Layer** is treated as the first layer to be painted onto this transparent canvas.
- We force `opacity: 100` and `blendMode: 'normal'` when *calculating* the background layer's specific color contribution (to get the pure color), but then blend it into the canvas using the *actual* layer opacity.
- Alpha (`currentA`) is accumulated as layers are added.

**Key Code Snippet (Generic):**
```typescript
// Start with transparent base
let currentR = 0;
let currentG = 0;
let currentB = 0;
let currentA = 0;

if (backgroundLayer.visible !== false) {
  // Get pure background color (force normal/100%)
  [currentR, currentG, currentB] = applyLayerWithPattern(
    x, y, gray, 
    { ...backgroundLayer, opacity: 100, blendMode: 'normal' }, 
    0, 0, 0, 
    previewScaleRatio
  );
  // Set output alpha based on background opacity
  currentA = (backgroundLayer.opacity / 100) * 255;
}
```

### 2. Hide Blend Mode Selector (`src/components/LayerControls.tsx`)
We updated the `LayerControls` component to conditionally render the Blend Mode selector.

**Change:**
Wrapped the Blend Mode `<Select>` block in:
```tsx
{!isBackgroundLayer(index) && (
  <div className="space-y-2">
    ... Blend Mode Select ...
  </div>
)}
```
This ensures the background layer (the last layer in the list) does not show this control.

## Verification
- **Code Review:** Verified all dither functions in `imageProcessing.ts` adopt the new transparency logic.
- **UI Logic:** Confirmed `isBackgroundLayer` check correctly targets the last layer.
