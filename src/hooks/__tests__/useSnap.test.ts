import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSnap } from '../useWindow/useSnap';
import { SNAP_THRESHOLD } from '../useWindow/constants';

describe('useSnap', () => {
  const setSnapPreview = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.innerWidth = 1000;
    global.innerHeight = 800;
  });

  it('should not snap if within bounds', () => {
    const { result } = renderHook(() => useSnap(setSnapPreview));

    act(() => {
      result.current.detectSnap(500, 400);
    });

    expect(result.current.currentSide.current).toBeNull();
    expect(setSnapPreview).not.toHaveBeenCalled();
  });

  it('should detect left snap', () => {
    const { result } = renderHook(() => useSnap(setSnapPreview));

    act(() => {
      result.current.detectSnap(SNAP_THRESHOLD - 1, 400);
    });

    expect(result.current.currentSide.current).toBe('left');
    expect(setSnapPreview).toHaveBeenCalledWith({ side: 'left' });
  });

  it('should detect right snap', () => {
    const { result } = renderHook(() => useSnap(setSnapPreview));

    act(() => {
      result.current.detectSnap(1000 - SNAP_THRESHOLD + 1, 400);
    });

    expect(result.current.currentSide.current).toBe('right');
    expect(setSnapPreview).toHaveBeenCalledWith({ side: 'right' });
  });

  it('should detect top snap (maximize)', () => {
    const { result } = renderHook(() => useSnap(setSnapPreview));

    act(() => {
      result.current.detectSnap(500, SNAP_THRESHOLD - 1);
    });

    expect(result.current.currentSide.current).toBe('top');
    expect(setSnapPreview).toHaveBeenCalledWith({ side: 'top' });
  });

  it('should detect top-left corner snap (not top)', () => {
    const { result } = renderHook(() => useSnap(setSnapPreview));

    act(() => {
      result.current.detectSnap(SNAP_THRESHOLD - 1, SNAP_THRESHOLD - 1);
    });

    expect(result.current.currentSide.current).toBe('top-left');
  });

  it('should detect top-right corner snap (not top)', () => {
    const { result } = renderHook(() => useSnap(setSnapPreview));

    act(() => {
      result.current.detectSnap(1000 - SNAP_THRESHOLD + 1, SNAP_THRESHOLD - 1);
    });

    expect(result.current.currentSide.current).toBe('top-right');
  });

  it('should detect bottom-left corner snap', () => {
    const { result } = renderHook(() => useSnap(setSnapPreview));

    act(() => {
      result.current.detectSnap(SNAP_THRESHOLD - 1, 800 - SNAP_THRESHOLD + 1);
    });

    expect(result.current.currentSide.current).toBe('bottom-left');
  });

  it('should detect bottom-right corner snap', () => {
    const { result } = renderHook(() => useSnap(setSnapPreview));

    act(() => {
      result.current.detectSnap(1000 - SNAP_THRESHOLD + 1, 800 - SNAP_THRESHOLD + 1);
    });

    expect(result.current.currentSide.current).toBe('bottom-right');
  });

  it('should not trigger top snap when in left corner zone', () => {
    const { result } = renderHook(() => useSnap(setSnapPreview));

    // Left edge + top edge = top-left, not top
    act(() => {
      result.current.detectSnap(5, 5);
    });

    expect(result.current.currentSide.current).toBe('top-left');
    expect(result.current.currentSide.current).not.toBe('top');
  });

  it('should reset snap', () => {
    const { result } = renderHook(() => useSnap(setSnapPreview));

    act(() => {
      result.current.detectSnap(0, 400);
    });
    expect(result.current.currentSide.current).toBe('left');

    act(() => {
      result.current.resetSnap();
    });

    expect(result.current.currentSide.current).toBeNull();
    expect(setSnapPreview).toHaveBeenCalledWith(null);
  });
});
