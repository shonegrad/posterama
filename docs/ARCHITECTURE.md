# Posterama Application Analysis

## Overview
Posterama is a client-side **4-Layer Threshold Image Editor**. It allows users to upload images and transform them using various dithering algorithms and pattern effects, organizing the result into customizable layers based on brightness thresholds.

## Core Features

### 1. Image Processing Pipeline
- **Input**: Accepts common image formats (JPEG, PNG, WebP).
- **Color Extraction**: Automatically extracts a color palette from the uploaded image to populate layer colors.
- **Optimization**: Creates a downscaled preview for real-time editing while preserving the ability to render the full-resolution image for download.

### 2. Rendering Algorithms
The application implements a wide range of error-diffusion and ordered dithering algorithms:
- **Error Diffusion**:
  - *Floyd-Steinberg* (Standard, good detail)
  - *Atkinson* (High contrast, "MacPaint" style)
  - *Jarvis, Judice, and Ninke* (High quality, computationally expensive)
  - *Stucki* (Sharper than Jarvis)
  - *Burkes* (Fast, good quality)
  - *Sierra* (Similar to Jarvis but faster)
  - *Riemersma* (Space-filling curve, unique texture)
- **Ordered Dithering**:
  - *Bayer Matrix* (Classic cross-hatch style look)
- **Layer-Based**:
  - Simple thresholding without dithering.

### 3. Layer System
The image is processed into **4 distinct layers**:
1.  **Background Layer**: Visible pixels that don't meet any threshold.
2.  **Threshold Layers (1-3)**: Pixels darker than specific grayscale values (0-255).

Each layer is customizable with:
- **Threshold**: The brightness cutoff point.
- **Color**: Hex color.
- **Blend Mode**: Standard compositing modes.
- **Opacity**: Transparency level.
- **Pattern**: Procedural patterns (Halftone, Screentone, Noise, Lines, Dots, Waves, Hexagon, Brick, Fabric).

## Architecture

### Frontend Stack
- **React**: UI library.
- **Vite**: Build tool and dev server.
- **Tailwind CSS**: Utility-first styling.
- **Shadcn UI**: Component library for the interface.

### Key Components
- **`useImageProcessor.ts`**: The "brain" of the app. It manages state, handles the `FileReader`, and orchestrates the processing pipeline. It uses an off-screen canvas to process images interacting with the rendering logic.
- **`imageProcessing.ts`**: Contains the raw implementation of the dithering algorithms and pixel manipulation logic. It operates directly on `ImageData` arrays for high performance.
- **patternGeneration.ts** (Inferred): Helper module for generating procedural patterns like halftones and lines.

## Data Flow
1.  **User Uploads Image** -> `processImageFile`
2.  **State Init** -> colors extracted, layers created, preview generated.
3.  **User Edits** (Changes Algorithm/Layer) -> `processImageOnCanvas`
4.  **Render** -> Selected algorithm processes pixel data -> Result pushed to Canvas.
5.  **Export** -> Reruns the pipeline on the original full-resolution image -> Downloads PNG.
