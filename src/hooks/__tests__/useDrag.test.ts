import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDrag } from '../useWindow/useDrag';
import { HEADER_VISIBLE } from '../useWindow/constants';

describe('useDrag', () => {
  let windowRef: any;
  const onMove = vi.fn();
  const onSnapCheck = vi.fn();
  const size = { width: 100, height: 100 };
  const position = { x: 0, y: 0 };

  beforeEach(() => {
    windowRef = {
      current: {
        style: { left: '', top: '' },
      },
    };
    vi.clearAllMocks();
    global.innerWidth = 1000;
    global.innerHeight = 800;
  });

  it('should initialize not dragging', () => {
    const { result } = renderHook(() => useDrag(size, position, windowRef, onMove));
    expect(result.current.isDragging.current).toBe(false);
  });

  it('should start dragging', () => {
    const { result } = renderHook(() => useDrag(size, position, windowRef, onMove));
    const event = { clientX: 10, clientY: 10 } as React.MouseEvent;

    act(() => {
      result.current.startDrag(event);
    });

    expect(result.current.isDragging.current).toBe(true);
  });

  it('should update position on drag', () => {
    const { result } = renderHook(() => useDrag(size, position, windowRef, onMove));
    const startEvent = { clientX: 10, clientY: 10 } as React.MouseEvent;

    act(() => {
      result.current.startDrag(startEvent);
    });

    const moveEvent = { clientX: 20, clientY: 20 } as MouseEvent;
    act(() => {
      result.current.dragTo(moveEvent);
    });

    expect(windowRef.current.style.left).toBe('10px');
    expect(windowRef.current.style.top).toBe('10px');
    expect(onMove).toHaveBeenCalledWith({ x: 10, y: 10 });
  });

  it('should allow partial off-screen dragging to the right', () => {
    const { result } = renderHook(() => useDrag(size, position, windowRef, onMove));

    act(() => {
      result.current.startDrag({ clientX: 0, clientY: 0 } as React.MouseEvent);
    });

    // Drag far right -- should stop at viewport - HEADER_VISIBLE
    act(() => {
      result.current.dragTo({ clientX: 2000, clientY: 0 } as MouseEvent);
    });

    const maxRight = 1000 - HEADER_VISIBLE;
    expect(windowRef.current.style.left).toBe(`${maxRight}px`);
    expect(onMove).toHaveBeenCalledWith({ x: maxRight, y: 0 });
  });

  it('should allow partial off-screen dragging to the left', () => {
    const { result } = renderHook(() => useDrag(size, position, windowRef, onMove));

    act(() => {
      result.current.startDrag({ clientX: 0, clientY: 0 } as React.MouseEvent);
    });

    // Drag far left -- should stop at -(width - HEADER_VISIBLE)
    act(() => {
      result.current.dragTo({ clientX: -2000, clientY: 0 } as MouseEvent);
    });

    const maxLeft = -size.width + HEADER_VISIBLE;
    expect(windowRef.current.style.left).toBe(`${maxLeft}px`);
    expect(onMove).toHaveBeenCalledWith({ x: maxLeft, y: 0 });
  });

  it('should clamp vertical to keep header grabbable', () => {
    const { result } = renderHook(() => useDrag(size, position, windowRef, onMove));

    act(() => {
      result.current.startDrag({ clientX: 0, clientY: 0 } as React.MouseEvent);
    });

    // Drag far down -- header must stay at viewport - 42
    act(() => {
      result.current.dragTo({ clientX: 0, clientY: 2000 } as MouseEvent);
    });

    expect(windowRef.current.style.top).toBe(`${800 - 42}px`);
  });

  it('should not allow dragging above viewport', () => {
    const { result } = renderHook(() => useDrag(size, position, windowRef, onMove));

    act(() => {
      result.current.startDrag({ clientX: 0, clientY: 0 } as React.MouseEvent);
    });

    act(() => {
      result.current.dragTo({ clientX: 0, clientY: -2000 } as MouseEvent);
    });

    expect(windowRef.current.style.top).toBe('0px');
  });

  it('should call onSnapCheck if provided', () => {
    const { result } = renderHook(() => useDrag(size, position, windowRef, onMove, onSnapCheck));

    act(() => {
      result.current.startDrag({ clientX: 0, clientY: 0 } as React.MouseEvent);
    });

    act(() => {
      result.current.dragTo({ clientX: 50, clientY: 50 } as MouseEvent);
    });

    expect(onSnapCheck).toHaveBeenCalledWith(50, 50);
  });

  it('should support setDragOffset for mid-drag cursor repositioning', () => {
    const { result } = renderHook(() => useDrag(size, position, windowRef, onMove));

    act(() => {
      result.current.startDrag({ clientX: 50, clientY: 50 } as React.MouseEvent);
    });

    // Override the drag offset mid-drag
    act(() => {
      result.current.setDragOffset({ x: 200, y: 12 });
    });

    // Now drag -- position should be relative to the new offset
    act(() => {
      result.current.dragTo({ clientX: 300, clientY: 100 } as MouseEvent);
    });

    expect(windowRef.current.style.left).toBe('100px'); // 300 - 200
    expect(windowRef.current.style.top).toBe('88px'); // 100 - 12
  });
});
