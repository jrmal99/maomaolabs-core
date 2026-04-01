import { useRef, useCallback, useMemo } from 'react';
import { MIN_HEIGHT, MIN_WIDTH } from './constants';
import { Size, Position } from './types';

/** Which edge or corner is being resized. */
export type ResizeEdge = 'n' | 's' | 'e' | 'w' | 'nw' | 'ne' | 'sw' | 'se';

/**
 * Hook for multi-edge window resizing.
 * Supports all 4 edges and 4 corners. Resizing from top/left edges adjusts
 * the window position so the opposite edge stays fixed. All edges are clamped
 * to the viewport boundaries.
 */
export function useResize(
  size: Size,
  windowRef: React.RefObject<HTMLDivElement>,
  onResizeEnd: (size: Size) => void,
  positionRef?: React.MutableRefObject<Position>,
  onPositionChange?: (pos: Position) => void,
) {
  const isResizing = useRef(false);
  const start = useRef({ x: 0, y: 0, w: 0, h: 0, px: 0, py: 0, edge: '' as string });

  const resizeTo = useCallback(
    (e: MouseEvent) => {
      if (!isResizing.current) return;

      const { edge } = start.current;
      const dx = e.clientX - start.current.x;
      const dy = e.clientY - start.current.y;

      let newW = start.current.w;
      let newH = start.current.h;
      let newX = start.current.px;
      let newY = start.current.py;

      const vw = window.innerWidth;
      const vh = window.innerHeight;

      if (edge.includes('e')) {
        newW = Math.max(MIN_WIDTH, start.current.w + dx);
      }
      if (edge.includes('w')) {
        newW = Math.max(MIN_WIDTH, start.current.w - dx);
        newX = start.current.px + (start.current.w - newW);
      }
      if (edge.includes('s')) {
        newH = Math.max(MIN_HEIGHT, start.current.h + dy);
      }
      if (edge.includes('n')) {
        newH = Math.max(MIN_HEIGHT, start.current.h - dy);
        newY = start.current.py + (start.current.h - newH);
      }

      // Clamp: don't let any edge go outside the viewport
      if (newX < 0) {
        newW += newX;
        newX = 0;
      }
      if (newY < 0) {
        newH += newY;
        newY = 0;
      }
      if (newX + newW > vw) {
        newW = vw - newX;
      }
      if (newY + newH > vh) {
        newH = vh - newY;
      }

      // Re-enforce minimums after clamping
      newW = Math.max(MIN_WIDTH, newW);
      newH = Math.max(MIN_HEIGHT, newH);

      if (windowRef.current) {
        windowRef.current.style.width = `${newW}px`;
        windowRef.current.style.height = `${newH}px`;
        windowRef.current.style.left = `${newX}px`;
        windowRef.current.style.top = `${newY}px`;
      }

      onResizeEnd({ width: newW, height: newH });
      if (positionRef) positionRef.current = { x: newX, y: newY };
      if (onPositionChange) onPositionChange({ x: newX, y: newY });
    },
    [onResizeEnd, positionRef, onPositionChange],
  );

  const startResize = useCallback(
    (e: React.MouseEvent, edge: ResizeEdge = 'se') => {
      window.getSelection()?.removeAllRanges();
      document.body.style.userSelect = 'none';
      const pos = positionRef ? positionRef.current : { x: 0, y: 0 };
      start.current = {
        x: e.clientX,
        y: e.clientY,
        w: size.width,
        h: size.height,
        px: pos.x,
        py: pos.y,
        edge,
      };
      isResizing.current = true;
    },
    [size.width, size.height, positionRef],
  );

  const stopResize = useCallback(() => {
    isResizing.current = false;
    document.body.style.userSelect = 'auto';
  }, []);

  return useMemo(
    () => ({
      resizeTo,
      startResize,
      stopResize,
      isResizing,
    }),
    [resizeTo, startResize, stopResize],
  );
}
