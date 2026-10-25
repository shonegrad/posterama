# Development Notes

## Test Image Auto-Load (REMOVED)

**Status**: REMOVED (2026-10-24)  
The startup auto-load of `/test-image.jpg` (previously flagged
"TODO: Remove this in production") has been deleted, along with
`public/test-image.jpg`. The app now boots to the upload screen as intended.

---

## Recent Changes Log

### 2025-12-11 - Image Scale Control
- ✅ Moved scale slider to bottom zoom/pan section
- ✅ Added re-processing when scale changes (preview = export)
- ✅ Fixed slider width (increased from min-w-48 to min-w-64)
- ✅ Added auto-load test image for easier development
