# Implementation Plan - Enhanced Color Presets

## Objective
To improve the aesthetic appeal of the application by providing a curated selection of "Coolors.co-style" color presets. These presets will utilize not just colors, but also the newly implemented pattern and blend mode features to create distinct artistic styles.

## Proposed Presets

We will replace the existing basic presets with the following:

1.  **Cyberpunk (Neon)**
    *   **Colors:** Deep Purple (#0D0221), Hot Pink (#FF0090), Cyan (#00F0FF), White (#FFFFFF)
    *   **Style:** Futuristic, high contrast.
    *   **Layers:**
        *   Layer 1 (Shadows): Deep Purple
        *   Layer 2 (Mids): Cyan, 'lines' pattern (scanlines)
        *   Layer 3 (Highs): Hot Pink, 'screen' blend mode
        *   Background: Dark #050505

2.  **Risograph (Print)**
    *   **Colors:** Fluorescent Pink (#FF48B0), Teal (#0078BF), Yellow (#FFE800), Paper White (#F6F6F5)
    *   **Style:** Overprinted ink look.
    *   **Layers:**
        *   Layer 1: Teal, 'multiply' blend mode, 'noise' pattern (grain)
        *   Layer 2: Pink, 'multiply' blend mode, 'halftone' pattern
        *   Layer 3: Yellow, 'multiply' blend mode
        *   Background: Paper White

3.  **Gameboy (Retro)**
    *   **Colors:** Darkest Green (#0F380F), Dark Green (#306230), Light Green (#8BAC0F), Lightest Green (#9BBC0F)
    *   **Style:** 8-bit nostalgia.
    *   **Layers:**
        *   Standard threshold layering, no transparency, 'dots' or 'pixel' effect (simulated via pattern size).

4.  **Blueprint (Technical)**
    *   **Colors:** Blueprint Blue (#0052CC), White lines.
    *   **Style:** Architectural.
    *   **Layers:**
        *   Layer 1: White, 'lines' pattern (grid).
        *   Background: Blueprint Blue.

5.  **Pop Art (Warhol)**
    *   **Colors:** Red (#E60023), Blue (#0057E7), Yellow (#FFD700), Black (#000000)
    *   **Layers:**
        *   High contrast, 'halftone' patterns with large size.

6.  **Nordic (Minimal)**
    *   **Colors:** Charcoal (#2C3E50), Slate (#7F8C8D), Muted Blue (#34495E), White (#ECF0F1)
    *   **Style:** Clean, flat.

7.  **Sepia (Vintage)**
    *   **Colors:** Brown (#704214), Tan (#D2B48C), Cream (#F5F5DC).
    *   **Style:** Old photo, utilizing 'noise' for grain.

8.  **Vaporwave (Aesthetic)**
    *   **Colors:** Lavender (#E6E6FA), Mint (#98FF98), Pale Pink (#FADADD).
    *   **Style:** Soft, pastel, 'waves' pattern.

## Implementation Steps

1.  **Update `src/lib/constants.ts`**:
    *   Redefine `COLOR_PRESETS` object with new configurations.
    *   Ensure all `LayerConfig` properties (pattern, blendMode, etc.) are correctly set for each preset.

## Verification
*   Load app.
*   Apply each preset.
*   Check that colors, patterns, and blend modes apply correctly.
