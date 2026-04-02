import { useRef, useCallback, useMemo } from 'react';
import { HEADER_VISIBLE } from './constants';
import { Position, Size } from './types';

/**
 * Hook for window dragging behavior.
 * Allows partial off-screen dragging while keeping at least 100px of the
 * header visible. Provides `setDragOffset` for mid-drag cursor re-centering
 * (used during snap/maximize restore).
 */
export function useDrag(
  size: Size,
  position: Position,
  windowRef: React.RefObject<HTMLDivElement>,
  onMove: (pos: Position) => void,
  onSnapCheck?: (x: number, y: number) => void,
) {
  const isDragging = useRef(false);
  const start = useRef({ x: 0, y: 0 });

  const dragTo = useCallback(
    (e: MouseEvent) => {
      if (!isDragging.current) return;

      onSnapCheck?.(e.clientX, e.clientY);

      // Allow partial off-screen: keep at least HEADER_VISIBLE px of header inside viewport
      const x = Math.min(
        Math.max(-size.width + HEADER_VISIBLE, e.clientX - start.current.x),
        window.innerWidth - HEADER_VISIBLE,
      );
      const y = Math.min(
        Math.max(0, e.clientY - start.current.y),
        window.innerHeight - 42, // keep header bar grabbable
      );

      if (windowRef.current) {
        windowRef.current.style.left = `${x}px`;
        windowRef.current.style.top = `${y}px`;
      }

      onMove({ x, y });
    },
    [size, onMove, onSnapCheck],
  );

  const startDrag = useCallback(
    (e: React.MouseEvent) => {
      window.getSelection()?.removeAllRanges();
      document.body.style.userSelect = 'none';
      start.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
      isDragging.current = true;
    },
    [position.x, position.y],
  );

  const stopDrag = useCallback(() => {
    isDragging.current = false;
    document.body.style.userSelect = 'auto';
  }, []);

  /** Patch the drag offset mid-drag (e.g. to re-center after unsnap resize). */
  const setDragOffset = useCallback((offset: { x: number; y: number }) => {
    start.current = offset;
  }, []);

  return useMemo(
    () => ({
      dragTo,
      startDrag,
      stopDrag,
      isDragging,
      setDragOffset,
    }),
    [dragTo, startDrag, stopDrag, setDragOffset],
  );
}
