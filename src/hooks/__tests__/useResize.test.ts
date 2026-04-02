import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useResize } from '../useWindow/useResize';
import { HEADER_VISIBLE, MIN_WIDTH, MIN_HEIGHT } from '../useWindow/constants';

describe('useResize', () => {
  let windowRef: any;
  const onResizeEnd = vi.fn();
  const onPositionChange = vi.fn();
  const size = { width: 500, height: 500 };

  function makePositionRef(x = 100, y = 100) {
    return { current: { x, y } };
  }

  beforeEach(() => {
    windowRef = {
      current: {
        style: { width: '', height: '', left: '', top: '' },
      },
    };
    vi.clearAllMocks();
    global.innerWidth = 1000;
    global.innerHeight = 800;
  });

  it('should initialize not resizing', () => {
    const { result } = renderHook(() => useResize(size, windowRef, onResizeEnd));
    expect(result.current.isResizing.current).toBe(false);
  });

  it('should start resizing', () => {
    const { result } = renderHook(() => useResize(size, windowRef, onResizeEnd));
    const event = { clientX: 100, clientY: 100 } as React.MouseEvent;

    act(() => {
      result.current.startResize(event);
    });

    expect(result.current.isResizing.current).toBe(true);
  });

  it('should resize from SE corner (default)', () => {
    const posRef = makePositionRef();
    const { result } = renderHook(() =>
      useResize(size, windowRef, onResizeEnd, posRef, onPositionChange),
    );

    act(() => {
      result.current.startResize({ clientX: 100, clientY: 100 } as React.MouseEvent);
    });
    act(() => {
      result.current.resizeTo({ clientX: 150, clientY: 150 } as MouseEvent);
    });

    expect(windowRef.current.style.width).toBe('550px');
    expect(windowRef.current.style.height).toBe('550px');
    expect(onResizeEnd).toHaveBeenCalledWith({ width: 550, height: 550 });
  });

  it('should resize from north edge', () => {
    const posRef = makePositionRef(100, 200);
    const { result } = renderHook(() =>
      useResize(size, windowRef, onResizeEnd, posRef, onPositionChange),
    );

    act(() => {
      result.current.startResize({ clientX: 300, clientY: 200 } as React.MouseEvent, 'n');
    });
    // Drag top edge up by 50px
    act(() => {
      result.current.resizeTo({ clientX: 300, clientY: 150 } as MouseEvent);
    });

    expect(windowRef.current.style.height).toBe('550px');
    expect(windowRef.current.style.top).toBe('150px');
  });

  it('should resize from west edge', () => {
    const posRef = makePositionRef(200, 100);
    const { result } = renderHook(() =>
      useResize(size, windowRef, onResizeEnd, posRef, onPositionChange),
    );

    act(() => {
      result.current.startResize({ clientX: 200, clientY: 300 } as React.MouseEvent, 'w');
    });
    // Drag left edge left by 50px
    act(() => {
      result.current.resizeTo({ clientX: 150, clientY: 300 } as MouseEvent);
    });

    expect(windowRef.current.style.width).toBe('550px');
    expect(windowRef.current.style.left).toBe('150px');
  });

  it('should resize from east edge', () => {
    const posRef = makePositionRef(100, 100);
    const { result } = renderHook(() =>
      useResize(size, windowRef, onResizeEnd, posRef, onPositionChange),
    );

    act(() => {
      result.current.startResize({ clientX: 600, clientY: 300 } as React.MouseEvent, 'e');
    });
    act(() => {
      result.current.resizeTo({ clientX: 700, clientY: 300 } as MouseEvent);
    });

    expect(windowRef.current.style.width).toBe('600px');
  });

  it('should resize from NW corner', () => {
    const posRef = makePositionRef(200, 200);
    const { result } = renderHook(() =>
      useResize(size, windowRef, onResizeEnd, posRef, onPositionChange),
    );

    act(() => {
      result.current.startResize({ clientX: 200, clientY: 200 } as React.MouseEvent, 'nw');
    });
    // Drag top-left corner up-left by 50px
    act(() => {
      result.current.resizeTo({ clientX: 150, clientY: 150 } as MouseEvent);
    });

    expect(windowRef.current.style.width).toBe('550px');
    expect(windowRef.current.style.height).toBe('550px');
    expect(windowRef.current.style.left).toBe('150px');
    expect(windowRef.current.style.top).toBe('150px');
  });

  it('should respect minimum dimensions', () => {
    const posRef = makePositionRef();
    const { result } = renderHook(() =>
      useResize(size, windowRef, onResizeEnd, posRef, onPositionChange),
    );

    act(() => {
      result.current.startResize({ clientX: 100, clientY: 100 } as React.MouseEvent);
    });
    act(() => {
      result.current.resizeTo({ clientX: -500, clientY: -500 } as MouseEvent);
    });

    expect(windowRef.current.style.width).toBe(`${MIN_WIDTH}px`);
    expect(windowRef.current.style.height).toBe(`${MIN_HEIGHT}px`);
  });

  // ── Viewport clamping tests ──

  it('should clamp east edge to viewport right', () => {
    const posRef = makePositionRef(700, 100);
    const { result } = renderHook(() =>
      useResize(size, windowRef, onResizeEnd, posRef, onPositionChange),
    );

    act(() => {
      result.current.startResize({ clientX: 900, clientY: 300 } as React.MouseEvent, 'e');
    });
    // Try to extend right edge past viewport (1000)
    act(() => {
      result.current.resizeTo({ clientX: 1500, clientY: 300 } as MouseEvent);
    });

    // Right edge should stop at viewport: width = 1000 - 700 = 300
    expect(windowRef.current.style.width).toBe('300px');
  });

  it('should clamp west edge to viewport left', () => {
    const posRef = makePositionRef(50, 100);
    const { result } = renderHook(() =>
      useResize(size, windowRef, onResizeEnd, posRef, onPositionChange),
    );

    act(() => {
      result.current.startResize({ clientX: 50, clientY: 300 } as React.MouseEvent, 'w');
    });
    // Try to drag left edge past viewport left
    act(() => {
      result.current.resizeTo({ clientX: -200, clientY: 300 } as MouseEvent);
    });

    expect(windowRef.current.style.left).toBe('0px');
  });

  it('should clamp south edge to viewport bottom', () => {
    const posRef = makePositionRef(100, 500);
    const { result } = renderHook(() =>
      useResize(size, windowRef, onResizeEnd, posRef, onPositionChange),
    );

    act(() => {
      result.current.startResize({ clientX: 300, clientY: 700 } as React.MouseEvent, 's');
    });
    act(() => {
      result.current.resizeTo({ clientX: 300, clientY: 1500 } as MouseEvent);
    });

    // Bottom edge should stop at viewport: height = 800 - 500 = 300
    expect(windowRef.current.style.height).toBe('300px');
  });

  it('should clamp north edge to viewport top', () => {
    const posRef = makePositionRef(100, 50);
    const { result } = renderHook(() =>
      useResize(size, windowRef, onResizeEnd, posRef, onPositionChange),
    );

    act(() => {
      result.current.startResize({ clientX: 300, clientY: 50 } as React.MouseEvent, 'n');
    });
    // Try to drag top edge above viewport
    act(() => {
      result.current.resizeTo({ clientX: 300, clientY: -200 } as MouseEvent);
    });

    expect(windowRef.current.style.top).toBe('0px');
  });

  // ── 100px header visible boundary tests ──

  it('should maintain HEADER_VISIBLE boundary when shrinking east edge leftward', () => {
    // Window is off-screen to the left (x = -400), resize the right edge leftward
    const posRef = makePositionRef(-400, 100);
    const { result } = renderHook(() =>
      useResize(size, windowRef, onResizeEnd, posRef, onPositionChange),
    );

    act(() => {
      result.current.startResize({ clientX: 100, clientY: 300 } as React.MouseEvent, 'e');
    });
    // Drag right edge far left -- should stop at HEADER_VISIBLE (100px from viewport left)
    act(() => {
      result.current.resizeTo({ clientX: -800, clientY: 300 } as MouseEvent);
    });

    // Right edge = newX + newW should be at least HEADER_VISIBLE
    const rightEdge =
      parseInt(windowRef.current.style.left || '-400') + parseInt(windowRef.current.style.width);
    expect(rightEdge).toBeGreaterThanOrEqual(HEADER_VISIBLE);
  });

  it('should maintain HEADER_VISIBLE boundary when shrinking west edge rightward', () => {
    // Window is off-screen to the right (x = 800), resize the left edge rightward
    const posRef = makePositionRef(800, 100);
    const { result } = renderHook(() =>
      useResize(size, windowRef, onResizeEnd, posRef, onPositionChange),
    );

    act(() => {
      result.current.startResize({ clientX: 800, clientY: 300 } as React.MouseEvent, 'w');
    });
    // Drag left edge far right -- should stop at vw - HEADER_VISIBLE
    act(() => {
      result.current.resizeTo({ clientX: 2000, clientY: 300 } as MouseEvent);
    });

    const leftEdge = parseInt(windowRef.current.style.left);
    expect(leftEdge).toBeLessThanOrEqual(1000 - HEADER_VISIBLE);
  });

  it('should keep header grabbable when north edge resized downward', () => {
    const posRef = makePositionRef(100, 600);
    const { result } = renderHook(() =>
      useResize(size, windowRef, onResizeEnd, posRef, onPositionChange),
    );

    act(() => {
      result.current.startResize({ clientX: 300, clientY: 600 } as React.MouseEvent, 'n');
    });
    // Drag top edge far down -- header must stay on screen
    act(() => {
      result.current.resizeTo({ clientX: 300, clientY: 2000 } as MouseEvent);
    });

    const topEdge = parseInt(windowRef.current.style.top);
    expect(topEdge).toBeLessThanOrEqual(800 - MIN_HEIGHT);
  });
});
