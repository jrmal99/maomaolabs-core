'use client';

import React, { useMemo, useCallback, memo, FC, useEffect, useRef, useState } from 'react';
import { WindowContext } from './WindowContext';
import { useWindowActions, useWindowSnap } from '../../store/window-system-context';
import { useSystemStyle } from '../../store/WindowSystemProvider';
import { useWindowStatus } from '../../hooks/useWindow/useWindowStatus';
import type { ResizeEdge } from '../../hooks/useWindow/useResize';
import WindowHeader from './WindowHeader';

import styles from '../../styles/Window.module.css';
import { WindowProps, WindowContextState } from '../../types';
import { ANIMATION_DURATION } from '../../store/constants';
import getSnapMap from './snapMap';

const RESIZE_HANDLES: { edge: ResizeEdge; style: React.CSSProperties }[] = [
  // Edges
  { edge: 'n', style: { top: 0, left: 6, right: 6, height: 6, cursor: 'n-resize' } },
  { edge: 's', style: { bottom: 0, left: 6, right: 6, height: 6, cursor: 's-resize' } },
  { edge: 'w', style: { left: 0, top: 6, bottom: 6, width: 6, cursor: 'w-resize' } },
  { edge: 'e', style: { right: 0, top: 6, bottom: 6, width: 6, cursor: 'e-resize' } },
  // Corners
  { edge: 'nw', style: { top: 0, left: 0, width: 12, height: 12, cursor: 'nw-resize' } },
  { edge: 'ne', style: { top: 0, right: 0, width: 12, height: 12, cursor: 'ne-resize' } },
  { edge: 'sw', style: { bottom: 0, left: 0, width: 12, height: 12, cursor: 'sw-resize' } },
  { edge: 'se', style: { bottom: 0, right: 0, width: 12, height: 12, cursor: 'se-resize' } },
];

const Window: FC<WindowProps> = ({ window: windowInstance }) => {
  const { closeWindow, focusWindow, updateWindow } = useWindowActions();
  const { setSnapPreview } = useWindowSnap();
  const systemStyle = useSystemStyle();

  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let animationFrameId: number;
    animationFrameId = requestAnimationFrame(() => setIsOpen(true));
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    timeoutRef.current = setTimeout(() => {
      closeWindow(windowInstance.id);
    }, ANIMATION_DURATION);
  }, [closeWindow, windowInstance.id]);

  const handleMinimize = useCallback(() => {
    updateWindow(windowInstance.id, { isMinimized: true });
  }, [updateWindow, windowInstance.id]);

  const handleMaximize = useCallback(() => {
    // Remember pre-maximize size so dragging from header restores it
    const preSnap =
      !windowInstance.isSnapped && !windowInstance.isMaximized
        ? { width: windowInstance.size.width, height: windowInstance.size.height }
        : (windowInstance._preSnapSize ?? null);
    updateWindow(windowInstance.id, {
      isMaximized: true,
      isMinimized: false,
      isSnapped: false,
      _preSnapSize: preSnap,
    });
  }, [
    updateWindow,
    windowInstance.id,
    windowInstance.isSnapped,
    windowInstance.isMaximized,
    windowInstance.size,
    windowInstance._preSnapSize,
  ]);

  const handleRestore = useCallback(() => {
    updateWindow(windowInstance.id, { isMinimized: false, isMaximized: false, isSnapped: false });
  }, [updateWindow, windowInstance.id]);

  const handleSnap = useCallback(
    (
      side: 'top' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right',
    ) => {
      // Remember the pre-snap/pre-maximize size
      const preSnap =
        !windowInstance.isSnapped && !windowInstance.isMaximized
          ? { width: windowInstance.size.width, height: windowInstance.size.height }
          : (windowInstance._preSnapSize ?? null);

      // Top snap = maximize
      if (side === 'top') {
        updateWindow(windowInstance.id, {
          isMaximized: true,
          isSnapped: false,
          _snapSide: null,
          _preSnapSize: preSnap,
          isMinimized: false,
        });
        return;
      }

      const snapMap = getSnapMap();
      const { width, height, x, y } = snapMap[side];

      updateWindow(windowInstance.id, {
        isSnapped: true,
        _snapSide: side,
        _preSnapSize: preSnap,
        isMaximized: false,
        isMinimized: false,
        size: { width, height },
        position: { x, y },
      });
    },
    [
      updateWindow,
      windowInstance.id,
      windowInstance.isSnapped,
      windowInstance.isMaximized,
      windowInstance.size,
      windowInstance._preSnapSize,
    ],
  );

  const handleUnsnap = useCallback(
    (restoreSize: boolean, wasMaximized: boolean) => {
      const update: Partial<typeof windowInstance> = {
        isSnapped: false,
        _snapSide: null,
        _preSnapSize: null,
      };
      if (wasMaximized) {
        update.isMaximized = false;
      }
      if (restoreSize && windowInstance._preSnapSize) {
        update.size = windowInstance._preSnapSize;
      }
      updateWindow(windowInstance.id, update);
    },
    [updateWindow, windowInstance.id, windowInstance._preSnapSize],
  );

  const handlePositionChange = useCallback(
    (pos: { x: number; y: number }) => {
      updateWindow(windowInstance.id, { position: pos });
    },
    [updateWindow, windowInstance.id],
  );

  const handleSizeChange = useCallback(
    (sz: { width: number; height: number }) => {
      updateWindow(windowInstance.id, { size: sz });
    },
    [updateWindow, windowInstance.id],
  );

  const { size, position, isDragging, isResizing, drag, resize, windowRef } = useWindowStatus({
    initialSize: windowInstance.size,
    initialPosition: windowInstance.position,
    isMinimized: windowInstance.isMinimized || false,
    isMaximized: windowInstance.isMaximized || false,
    isSnapped: windowInstance.isSnapped || false,
    preSnapSize: windowInstance._preSnapSize ?? null,
    onSnap: handleSnap,
    onUnsnap: handleUnsnap,
    setSnapPreview,
    onPositionChange: handlePositionChange,
    onSizeChange: handleSizeChange,
  });

  const uiValue: WindowContextState = useMemo(
    () => ({
      size,
      position,
      isDragging,
      isResizing,
      drag,
      resize: (e: React.MouseEvent) => resize(e),
      windowRef,
      isMinimized: windowInstance.isMinimized || false,
      isMaximized: windowInstance.isMaximized || false,
      isSnapped: windowInstance.isSnapped || false,
      minimize: handleMinimize,
      maximize: handleMaximize,
      restore: handleRestore,
    }),
    [
      size,
      position,
      isDragging,
      isResizing,
      drag,
      resize,
      windowRef,
      windowInstance.isMinimized,
      windowInstance.isMaximized,
      windowInstance.isSnapped,
      handleMinimize,
      handleMaximize,
      handleRestore,
    ],
  );

  const isVisible = isOpen && !isClosing && !windowInstance.isMinimized;
  const isMaximized = windowInstance.isMaximized;
  const isMinimized = windowInstance.isMinimized;

  const containerStyle = useMemo(
    () => ({
      width: isMaximized ? undefined : size.width,
      height: isMinimized ? undefined : isMaximized ? undefined : size.height,
      left: isMaximized ? undefined : position.x,
      top: isMaximized ? undefined : position.y,
      zIndex: windowInstance.zIndex,
      display: 'flex' as const,
      pointerEvents: (isMinimized ? 'none' : 'auto') as React.CSSProperties['pointerEvents'],
      ...windowInstance.style,
    }),
    [size, position, isMaximized, isMinimized, windowInstance.zIndex, windowInstance.style],
  );

  return (
    <WindowContext.Provider value={uiValue}>
      <div
        ref={windowRef}
        id={`window-${windowInstance.id}`}
        role='dialog'
        aria-label={windowInstance.title}
        aria-modal='false'
        tabIndex={-1}
        className={`window-container
        ${styles.container}
        ${!isDragging && !isResizing ? `${styles.transition} window-transition` : ''}
        ${isVisible ? styles.visible : styles.hidden}
        ${isMaximized ? styles.maximized : ''}
        ${isMinimized ? styles.minimized : ''}
        ${windowInstance.className || ''}
        `}
        data-system-style={systemStyle}
        style={containerStyle}
        onMouseDown={() => focusWindow(windowInstance.id)}
      >
        <WindowHeader
          onClose={handleClose}
          title={windowInstance.title}
          icon={windowInstance.icon}
          canClose={windowInstance.canClose}
          canMinimize={windowInstance.canMinimize}
          canMaximize={windowInstance.canMaximize}
        />

        <div
          className={`window-scrollbar ${styles.scrollbar} ${styles.content}`}
          style={{ display: isMinimized ? 'none' : 'flex' }}
        >
          {windowInstance.component}
        </div>

        {!isMaximized &&
          RESIZE_HANDLES.map(({ edge, style }) => (
            <div
              key={edge}
              className='window-resize-handle'
              style={{ position: 'absolute', zIndex: 60, ...style }}
              onMouseDown={(e) => resize(e, edge)}
            />
          ))}
      </div>
    </WindowContext.Provider>
  );
};

export default memo(Window);
