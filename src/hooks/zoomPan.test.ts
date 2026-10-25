import { renderHook, act } from '@testing-library/react';
import { useZoomPan } from './useZoomPan';

describe('useZoomPan', () => {
  it('initializes with zoomLevel=1', () => {
    const { result } = renderHook(() => useZoomPan({ canvasRef: { current: null } as any }));
    expect(result.current.zoomLevel).toBe(1);
  });

  it('fitToScreen sets reasonable zoom when canvas exists', () => {
    const canvasRef = { current: { getBoundingClientRect: () => ({ width: 400, height: 300 }) } } as any;
    const updateStatus = () => {};
    const { result } = renderHook(() => useZoomPan({ canvasRef, updateStatus }));
    act(() => {
      result.current.fitToScreen();
    });
    // zoomLevel should be set to something reasonable
    expect(result.current.zoomLevel).toBeGreaterThan(0);
  });

  it('zoomIn increases zoomLevel', () => {
    const { result } = renderHook(() => useZoomPan({ canvasRef: { current: null } as any, updateStatus: () => {} }));
    act(() => {
      result.current.zoomIn();
    });
    expect(result.current.zoomLevel).toBeGreaterThan(1);
  });

  it('zoomOut decreases zoomLevel', () => {
    const { result } = renderHook(() => useZoomPan({ canvasRef: { current: null } as any, updateStatus: () => {} }));
    act(() => {
      result.current.zoomOut();
    });
    expect(result.current.zoomLevel).toBeLessThan(1);
  });
});