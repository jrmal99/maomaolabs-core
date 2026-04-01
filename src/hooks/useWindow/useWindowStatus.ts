import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { DEFAULT_POSITION, DEFAULT_SIZE } from './constants';
import { useDrag } from './useDrag';
import { useResize, type ResizeEdge } from './useResize';
import { useSnap } from './useSnap';
import { Position, Size, SnapSide } from './types';

/** Props for the useWindowStatus hook. */
export interface WindowStatusProps {
  initialSize?: Size;
  initialPosition?: Position;
  isMinimized: boolean;
  isMaximized: boolean;
  isSnapped?: boolean;
  preSnapSize?: Size | null;
  onSnap?: (side: SnapSide) => void;
  /** Called on unsnap/un-maximize. `restoreSize`: restore pre-snap size. `wasMaximized`: also clear maximized state. */
  onUnsnap?: (restoreSize: boolean, wasMaximized: boolean) => void;
  setSnapPreview?: (preview: { side: SnapSide } | null) => void;
  onPositionChange?: (pos: Position) => void;
  onSizeChange?: (size: Size) => void;
}

/**
 * Core window state hook. Orchestrates drag, resize, and snap behavior.
 * Handles instant unsnap with animated size restore, smart drag offset
 * calculation, and browser resize cancellation.
 */
export function useWindowStatus({
  initialSize = DEFAULT_SIZE,
  initialPosition = DEFAULT_POSITION,
  isMaximized,
  isSnapped,
  preSnapSize,
  onSnap,
  onUnsnap,
  setSnapPreview,
  onPositionChange,
  onSizeChange,
}: WindowStatusProps) {
  const [size, setSize] = useState<Size>(initialSize);
  const [position, setPosition] = useState<Position>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const lastSize = useRef(initialSize);
  const lastPosition = useRef(initialPosition);
  const windowRef = useRef<HTMLDivElement>(null);
  const wasSnappedOnDragStart = useRef(false);
  const skipNextDragTo = useRef(false);

  const updateLastPosition = useCallback((pos: Position) => {
    lastPosition.current = pos;
  }, []);

  const updateLastSize = useCallback((s: Size) => {
    lastSize.current = s;
  }, []);

  useEffect(() => {
    setSize(initialSize);
    updateLastSize(initialSize);
  }, [initialSize, updateLastSize]);

  useEffect(() => {
    setPosition(initialPosition);
    updateLastPosition(initialPosition);
  }, [initialPosition, updateLastPosition]);

  const snap = useSnap(setSnapPreview);
  const drag = useDrag(size, position, windowRef, updateLastPosition, snap.detectSnap);
  const resize = useResize(size, windowRef, updateLastSize, lastPosition, updateLastPosition);

  const isMaximizedRef = useRef(false);

  const startDrag = useCallback(
    (e: React.MouseEvent) => {
      wasSnappedOnDragStart.current = !!isSnapped || !!isMaximized;
      isMaximizedRef.current = !!isMaximized;
      setIsDragging(true);
      drag.startDrag(e);
    },
    [drag, isSnapped, isMaximized],
  );

  const startResize = useCallback(
    (e: React.MouseEvent, edge?: ResizeEdge) => {
      setIsResizing(true);
      resize.startResize(e, edge);
    },
    [resize],
  );

  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const move = (e: MouseEvent) => {
      // If the mouse button was released outside the window (e.g. during browser resize),
      // e.buttons will be 0. Treat this as the end of the drag/resize.
      if (e.buttons === 0) {
        end();
        return;
      }

      // Instant unsnap: on first move while dragging a snapped window, restore pre-snap size
      if (wasSnappedOnDragStart.current && drag.isDragging.current) {
        wasSnappedOnDragStart.current = false;

        const restoreW = preSnapSize?.width ?? size.width;
        const restoreH = preSnapSize?.height ?? size.height;

        // Smart drag offset: preserve the cursor's relative position on the header.
        // For maximized windows, use viewport dimensions directly (CSS overrides the
        // React state values). For snapped windows, use getBoundingClientRect.
        const rect = windowRef.current?.getBoundingClientRect();
        const snappedW = isMaximizedRef.current ? window.innerWidth : (rect?.width ?? size.width);
        const halfRestored = restoreW / 2;
        const windowLeft = isMaximizedRef.current ? 0 : (rect?.left ?? position.x);
        const cursorInWindow = e.clientX - windowLeft;

        // Edge zone boundary: use the smaller of halfRestored and half the snapped width.
        // This ensures both left and right zones are reachable even when the snapped
        // window is narrower than the restored window.
        const edgeZone = Math.min(halfRestored, snappedW / 2);
        const distFromRight = snappedW - cursorInWindow;

        let offsetX: number;
        if (cursorInWindow < edgeZone) {
          // Near left edge -- preserve direct 1:1 pixel offset
          offsetX = cursorInWindow;
        } else if (distFromRight < edgeZone) {
          // Near right edge -- preserve direct distance from right
          offsetX = restoreW - distFromRight;
        } else {
          // Middle zone -- proportional: same % position on restored header
          offsetX = (cursorInWindow / snappedW) * restoreW;
        }

        // Compute the new left position so the cursor stays at offsetX within the restored window
        const newLeft = e.clientX - offsetX;

        lastSize.current = { width: restoreW, height: restoreH };
        lastPosition.current = { x: newLeft, y: e.clientY - 12 };

        if (windowRef.current) {
          const el = windowRef.current;
          const ease = 'cubic-bezier(0.25, 0.8, 0.25, 1)';

          // Anchor the resize animation from the side the user is grabbing.
          // Left half → origin at left (expand rightward). Right half → origin at right (expand leftward).
          const originX = cursorInWindow < snappedW / 2 ? '0px' : `${restoreW}px`;
          el.style.transformOrigin = `${originX} 12px`;
          el.style.transition = `width 0.2s ${ease}, height 0.2s ${ease}, left 0.2s ${ease}`;
          el.style.width = `${restoreW}px`;
          el.style.height = `${restoreH}px`;
          el.style.left = `${newLeft}px`;
          el.style.top = `${e.clientY - 12}px`;

          const cleanup = () => {
            el.style.transition = '';
            el.style.transformOrigin = '';
            el.removeEventListener('transitionend', cleanup);
          };
          el.addEventListener('transitionend', cleanup);
        }

        setSize({ width: restoreW, height: restoreH });
        onSizeChange?.({ width: restoreW, height: restoreH });
        drag.setDragOffset({ x: offsetX, y: 12 });

        // Fire unsnap callback -- restore pre-snap size (drag unsnap)
        onUnsnap?.(true, isMaximizedRef.current);
        isMaximizedRef.current = false;

        // Skip dragTo on this frame as the CSS transition is animating left/width.
        // dragTo would immediately override left and fight the transition.
        skipNextDragTo.current = true;
      }

      if (skipNextDragTo.current) {
        skipNextDragTo.current = false;
      } else {
        drag.dragTo(e);
      }
      resize.resizeTo(e);
    };

    const end = () => {
      wasSnappedOnDragStart.current = false;

      if (drag.isDragging.current) {
        const hasMoved =
          lastPosition.current.x !== position.x || lastPosition.current.y !== position.y;

        setPosition(lastPosition.current);

        if (snap.currentSide.current && onSnap) {
          onSnap(snap.currentSide.current);
          snap.resetSnap();
        } else if (hasMoved) {
          onPositionChange?.(lastPosition.current);
        }
        drag.stopDrag();
        setIsDragging(false);
      }

      if (resize.isResizing.current) {
        setSize(lastSize.current);
        setPosition(lastPosition.current);
        onSizeChange?.(lastSize.current);
        onPositionChange?.(lastPosition.current);
        if (isSnapped) onUnsnap?.(false, false); // resize unsnap — keep current size
        resize.stopResize();
        setIsResizing(false);
      }
    };

    // If the browser itself is resized while a drag/resize is active,
    // silently cancel without firing callbacks (WindowManager handles repositioning).
    const onBrowserResize = () => {
      wasSnappedOnDragStart.current = false;
      if (drag.isDragging.current) {
        drag.stopDrag();
        setIsDragging(false);
      }
      if (resize.isResizing.current) {
        resize.stopResize();
        setIsResizing(false);
      }
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
    window.addEventListener('resize', onBrowserResize);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', end);
      window.removeEventListener('resize', onBrowserResize);
    };
  }, [
    drag,
    resize,
    onSnap,
    onUnsnap,
    isSnapped,
    preSnapSize,
    snap,
    onPositionChange,
    onSizeChange,
    isDragging,
    isResizing,
    size,
    position,
  ]);

  return useMemo(
    () => ({
      size,
      position,
      windowRef,
      drag: startDrag,
      resize: startResize,
      isDragging,
      isResizing,
    }),
    [size, position, isDragging, isResizing, startDrag, startResize],
  );
}
