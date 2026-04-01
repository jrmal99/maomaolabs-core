import { useRef, useCallback, useMemo } from 'react';
import { SNAP_THRESHOLD } from './constants';
import { SnapSide } from './types';

export function useSnap(setSnapPreview?: (p: { side: SnapSide } | null) => void) {
  const currentSide = useRef<SnapSide | null>(null);

  const detectSnap = useCallback(
    (x: number, y: number) => {
      const screenW = window.innerWidth;
      const screenH = window.innerHeight;
      let next: SnapSide | null = null;

      if (x < SNAP_THRESHOLD) {
        if (y < SNAP_THRESHOLD) next = 'top-left';
        else if (y > screenH - SNAP_THRESHOLD) next = 'bottom-left';
        else next = 'left';
      } else if (x > screenW - SNAP_THRESHOLD) {
        if (y < SNAP_THRESHOLD) next = 'top-right';
        else if (y > screenH - SNAP_THRESHOLD) next = 'bottom-right';
        else next = 'right';
      }

      if (next !== currentSide.current) {
        currentSide.current = next;
        setSnapPreview?.(next ? { side: next } : null);
      }
    },
    [setSnapPreview],
  );

  const resetSnap = useCallback(() => {
    currentSide.current = null;
    setSnapPreview?.(null);
  }, [setSnapPreview]);

  return useMemo(() => ({ currentSide, detectSnap, resetSnap }), [detectSnap, resetSnap]);
}
