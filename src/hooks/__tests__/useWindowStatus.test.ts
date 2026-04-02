import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useWindowStatus } from '../useWindow/useWindowStatus';

describe('useWindowStatus', () => {
  const baseProps = {
    isMinimized: false,
    isMaximized: false,
    initialSize: { width: 400, height: 300 },
    initialPosition: { x: 100, y: 100 },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.innerWidth = 1000;
    global.innerHeight = 800;
  });

  it('should initialize with provided size and position', () => {
    const { result } = renderHook(() => useWindowStatus(baseProps));

    expect(result.current.size).toEqual(baseProps.initialSize);
    expect(result.current.position).toEqual(baseProps.initialPosition);
    expect(result.current.isDragging).toBe(false);
    expect(result.current.isResizing).toBe(false);
  });

  it('should handle drag start', () => {
    const { result } = renderHook(() => useWindowStatus(baseProps));
    const event = { clientX: 150, clientY: 150 } as React.MouseEvent;

    act(() => {
      result.current.drag(event);
    });

    expect(result.current.isDragging).toBe(true);
  });

  it('should handle resize start', () => {
    const { result } = renderHook(() => useWindowStatus(baseProps));
    const event = { clientX: 150, clientY: 150 } as React.MouseEvent;

    act(() => {
      result.current.resize(event);
    });

    expect(result.current.isResizing).toBe(true);
  });

  it('should handle resize start with edge parameter', () => {
    const { result } = renderHook(() => useWindowStatus(baseProps));
    const event = { clientX: 100, clientY: 200 } as React.MouseEvent;

    act(() => {
      result.current.resize(event, 'w');
    });

    expect(result.current.isResizing).toBe(true);
  });

  it('should accept preSnapSize prop', () => {
    const props = {
      ...baseProps,
      isSnapped: true,
      preSnapSize: { width: 600, height: 400 },
    };

    const { result } = renderHook(() => useWindowStatus(props));
    expect(result.current.size).toEqual(baseProps.initialSize);
  });

  it('should accept isMaximized prop', () => {
    const props = {
      ...baseProps,
      isMaximized: true,
    };

    const { result } = renderHook(() => useWindowStatus(props));
    // Should still track the initialSize in state
    expect(result.current.size).toEqual(baseProps.initialSize);
  });

  it('should track wasSnapped for maximized windows on drag start', () => {
    const onUnsnap = vi.fn();
    const props = {
      ...baseProps,
      isMaximized: true,
      isSnapped: false,
      preSnapSize: { width: 400, height: 300 },
      onUnsnap,
    };

    const { result } = renderHook(() => useWindowStatus(props));

    // Starting a drag on a maximized window should set wasSnappedOnDragStart
    act(() => {
      result.current.drag({ clientX: 500, clientY: 20 } as React.MouseEvent);
    });

    expect(result.current.isDragging).toBe(true);
  });

  it('should update size when initialSize changes', () => {
    const { result, rerender } = renderHook((props) => useWindowStatus(props), {
      initialProps: baseProps,
    });

    expect(result.current.size).toEqual({ width: 400, height: 300 });

    rerender({
      ...baseProps,
      initialSize: { width: 800, height: 600 },
    });

    expect(result.current.size).toEqual({ width: 800, height: 600 });
  });

  it('should update position when initialPosition changes', () => {
    const { result, rerender } = renderHook((props) => useWindowStatus(props), {
      initialProps: baseProps,
    });

    expect(result.current.position).toEqual({ x: 100, y: 100 });

    rerender({
      ...baseProps,
      initialPosition: { x: 200, y: 300 },
    });

    expect(result.current.position).toEqual({ x: 200, y: 300 });
  });
});
