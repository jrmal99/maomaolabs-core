'use client'

import React, { useMemo, useCallback, memo, FC, useEffect, useRef, useState } from 'react'
import { WindowContext } from './WindowContext'
import { useWindowActions, useWindowSnap } from '../../store/window-system-context'
import { useSystemStyle } from '../../store/WindowSystemProvider'
import { useWindowStatus } from '../../hooks/useWindow/useWindowStatus'
import WindowHeader from './WindowHeader'

import styles from '../../styles/Window.module.css'
import { WindowProps, WindowContextState } from '../../types'
import { ANIMATION_DURATION } from '../../store/constants'
import getSnapMap from './snapMap'


/**
 * Window component.
 * Renders a window with a header, content, and resize handle.
 * 
 * @param {WindowProps} props - The window properties.
 * @returns {JSX.Element} The window component.
 */
const Window: FC<WindowProps> = ({ window: windowInstance }) => {
  const { closeWindow, focusWindow, updateWindow } = useWindowActions()
  const { setSnapPreview } = useWindowSnap()
  const systemStyle = useSystemStyle()

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
    timeoutRef.current = setTimeout(() => { closeWindow(windowInstance.id); }, ANIMATION_DURATION);
  }, [closeWindow, windowInstance.id]);

  const handleMinimize = useCallback(() => {
    updateWindow(windowInstance.id, { isMinimized: true });
  }, [updateWindow, windowInstance.id]);

  const handleMaximize = useCallback(() => {
    updateWindow(windowInstance.id, { isMaximized: true, isMinimized: false, isSnapped: false });
  }, [updateWindow, windowInstance.id]);

  const handleRestore = useCallback(() => {
    updateWindow(windowInstance.id, { isMinimized: false, isMaximized: false, isSnapped: false });
  }, [updateWindow, windowInstance.id]);

  const handleSnap = useCallback(
    (side: 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right') => {
      const snapMap = getSnapMap();
      const { width, height, x, y } = snapMap[side];

      updateWindow(windowInstance.id, {
        isSnapped: true,
        isMaximized: false,
        isMinimized: false,
        size: { width, height },
        position: { x, y },
      });
    },
    [updateWindow, windowInstance.id]);

  const handleUnsnap = useCallback(() => {
    updateWindow(windowInstance.id, { isSnapped: false });
  }, [updateWindow, windowInstance.id]);

  const handlePositionChange = useCallback((pos: { x: number, y: number }) => {
    updateWindow(windowInstance.id, { position: pos });
  }, [updateWindow, windowInstance.id]);

  const handleSizeChange = useCallback((sz: { width: number, height: number }) => {
    updateWindow(windowInstance.id, { size: sz });
  }, [updateWindow, windowInstance.id]);

  const {
    size,
    position,
    isDragging,
    isResizing,
    drag,
    resize,
    windowRef
  } = useWindowStatus({
    initialSize: windowInstance.size,
    initialPosition: windowInstance.position,
    isMinimized: windowInstance.isMinimized || false,
    isMaximized: windowInstance.isMaximized || false,
    isSnapped: windowInstance.isSnapped || false,
    onSnap: handleSnap,
    onUnsnap: handleUnsnap,
    setSnapPreview,
    onPositionChange: handlePositionChange,
    onSizeChange: handleSizeChange
  })

  const uiValue: WindowContextState = useMemo(() => ({
    size,
    position,
    isDragging,
    isResizing,
    drag,
    resize,
    windowRef,
    isMinimized: windowInstance.isMinimized || false,
    isMaximized: windowInstance.isMaximized || false,
    isSnapped: windowInstance.isSnapped || false,
    minimize: handleMinimize,
    maximize: handleMaximize,
    restore: handleRestore
  }), [size, position, isDragging, isResizing, drag, resize, windowRef, windowInstance.isMinimized, windowInstance.isMaximized, windowInstance.isSnapped, handleMinimize, handleMaximize, handleRestore])

  const isVisible = isOpen && !isClosing && !windowInstance.isMinimized;
  const isMaximized = windowInstance.isMaximized;
  const isMinimized = windowInstance.isMinimized;

  // Memoized to avoid creating a new object reference on every render (drag/resize
  // fires ~60 times/sec — a new object would force unnecessary DOM style updates).
  const containerStyle = useMemo(() => ({
    width: isMaximized ? undefined : size.width,
    height: isMinimized ? undefined : isMaximized ? undefined : size.height,
    left: isMaximized ? undefined : position.x,
    top: isMaximized ? undefined : position.y,
    zIndex: windowInstance.zIndex,
    display: 'flex' as const,
    pointerEvents: (isMinimized ? 'none' : 'auto') as React.CSSProperties['pointerEvents'],
    ...windowInstance.style,
  }), [size, position, isMaximized, isMinimized, windowInstance.zIndex, windowInstance.style]);

  return (
    <WindowContext.Provider value={uiValue}>
      <div
        ref={windowRef}
        id={`window-${windowInstance.id}`}
        role="dialog"
        aria-label={windowInstance.title}
        aria-modal="false"
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

        {!isMaximized && (
          <div
            className={`window-resize-handle ${styles.resizeHandle}`}
            onMouseDown={resize}
          />
        )}

      </div>
    </WindowContext.Provider >
  )
}

export default memo(Window)
