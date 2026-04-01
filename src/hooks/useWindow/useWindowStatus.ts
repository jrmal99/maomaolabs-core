import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { DEFAULT_POSITION, DEFAULT_SIZE } from './constants';
import { useDrag } from './useDrag';
import { useResize } from './useResize';
import { useSnap } from './useSnap';
import { Position, Size, SnapSide } from './types';

export interface WindowStatusProps {
  initialSize?: Size;
  initialPosition?: Position;
  isMinimized: boolean;
  isMaximized: boolean;
  isSnapped?: boolean;
  onSnap?: (side: SnapSide) => void;
  onUnsnap?: () => void;
  setSnapPreview?: (preview: { side: SnapSide } | null) => void;
  onPositionChange?: (pos: Position) => void;
  onSizeChange?: (size: Size) => void;
}

export function useWindowStatus({
  initialSize = DEFAULT_SIZE,
  initialPosition = DEFAULT_POSITION,
  isSnapped,
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
  const resize = useResize(size, windowRef, updateLastSize);

  const startDrag = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      drag.startDrag(e);
    },
    [drag],
  );

  const startResize = useCallback(
    (e: React.MouseEvent) => {
      setIsResizing(true);
      resize.startResize(e);
    },
    [resize],
  );

  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const move = (e: MouseEvent) => {
      drag.dragTo(e);
      resize.resizeTo(e);
    };

    const end = () => {
      if (drag.isDragging.current) {
        const hasMoved =
          lastPosition.current.x !== position.x || lastPosition.current.y !== position.y;

        setPosition(lastPosition.current);

        if (snap.currentSide.current && onSnap) {
          onSnap(snap.currentSide.current);
          snap.resetSnap();
        } else if (hasMoved) {
          if (isSnapped) onUnsnap?.();
          onPositionChange?.(lastPosition.current);
        }
        drag.stopDrag();
        setIsDragging(false);
      }

      if (resize.isResizing.current) {
        setSize(lastSize.current);
        onSizeChange?.(lastSize.current);
        if (isSnapped) onUnsnap?.();
        resize.stopResize();
        setIsResizing(false);
      }
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', end);
    };
  }, [
    drag,
    resize,
    onSnap,
    onUnsnap,
    isSnapped,
    snap,
    onPositionChange,
    onSizeChange,
    isDragging,
    isResizing,
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
