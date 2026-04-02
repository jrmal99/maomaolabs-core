import { useRef, useCallback, useMemo } from 'react';
import { HEADER_VISIBLE, MIN_HEIGHT, MIN_WIDTH } from './constants';
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

      // Calculate raw desired values, then clamp the active edge to the viewport.
      // When the position hits a boundary, the dimension freezes too.

      // Each active edge is clamped to stay within [HEADER_VISIBLE, vw - HEADER_VISIBLE]
      // so at least 100px of the window remains visible on each side.

      if (edge.includes('e')) {
        newW = Math.max(MIN_WIDTH, start.current.w + dx);
        const rightEdge = newX + newW;
        // Right edge can't go past viewport right
        if (rightEdge > vw) newW = vw - newX;
        // Right edge can't shrink past 100px from viewport left
        if (rightEdge < HEADER_VISIBLE) newW = HEADER_VISIBLE - newX;
      }
      if (edge.includes('w')) {
        newW = Math.max(MIN_WIDTH, start.current.w - dx);
        newX = start.current.px + (start.current.w - newW);
        // Left edge can't go past viewport left
        if (newX < 0) {
          newW += newX;
          newX = 0;
        }
        // Left edge can't shrink past 100px from viewport right
        if (newX > vw - HEADER_VISIBLE) {
          newW += newX - (vw - HEADER_VISIBLE);
          newX = vw - HEADER_VISIBLE;
        }
      }
      if (edge.includes('s')) {
        newH = Math.max(MIN_HEIGHT, start.current.h + dy);
        const bottomEdge = newY + newH;
        // Bottom edge can't go past viewport bottom
        if (bottomEdge > vh) newH = vh - newY;
        // Bottom edge can't shrink past viewport top
        if (bottomEdge < 0) newH = -newY;
      }
      if (edge.includes('n')) {
        newH = Math.max(MIN_HEIGHT, start.current.h - dy);
        newY = start.current.py + (start.current.h - newH);
        // Top edge can't go past viewport top
        if (newY < 0) {
          newH += newY;
          newY = 0;
        }
        // Top edge can't go below viewport bottom (keep header grabbable)
        if (newY > vh - MIN_HEIGHT) {
          newH += newY - (vh - MIN_HEIGHT);
          newY = vh - MIN_HEIGHT;
        }
      }

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
