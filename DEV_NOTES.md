# Development Notes

## Temporary Test Image Auto-Load

**Status**: ACTIVE (for development/testing only)  
**Location**: `src/components/ImageProcessor.tsx` (lines ~202-242)

### What it does:
- Automatically loads a colorful gradient test pattern on app startup
- Generates an 800×600px image with gradient and shapes
- Only loads if no image is currently present

### TODO - Remove Before Production:
```tsx
// TODO: Remove this in production - Auto-load test image for development
useEffect(() => {
  // ... test image generation code ...
}, []);
```

**When to remove**: Before final production build or when testing is complete.

**How to remove**: Simply delete the entire `useEffect` block (marked with TODO comment).

---

## Recent Changes Log

### 2025-12-11 - Image Scale Control
- ✅ Moved scale slider to bottom zoom/pan section
- ✅ Added re-processing when scale changes (preview = export)
- ✅ Fixed slider width (increased from min-w-48 to min-w-64)
- ✅ Added auto-load test image for easier development
