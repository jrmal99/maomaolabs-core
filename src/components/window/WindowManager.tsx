'use client';

import { useEffect, useRef } from 'react';
import { useWindows, useWindowSnap } from '../../store/window-system-context';
import { useWindowStore } from '../../store/windowStore';
import Window from './Window';
import SnapOverlay from './SnapOverlay';
import getSnapMap from './snapMap';
import { HEADER_VISIBLE } from '../../hooks/useWindow/constants';
import styles from '../../styles/WindowManager.module.css';

/**
 * Main window manager component.
 * Renders all active windows managed by the WindowSystemProvider.
 * Handles browser resize: snapped windows stay proportional, unsnapped windows stay on-screen.
 *
 * @returns {JSX.Element} The window manager container.
 */
export default function WindowManager() {
  const windows = useWindows();
  const { snapPreview } = useWindowSnap();

  const prevSize = useRef({ w: window.innerWidth, h: window.innerHeight });

  useEffect(() => {
    const onResize = () => {
      const newW = window.innerWidth;
      const newH = window.innerHeight;
      const oldW = prevSize.current.w;
      const oldH = prevSize.current.h;
      prevSize.current = { w: newW, h: newH };

      const state = useWindowStore.getState();
      const snapLayout = getSnapMap();

      const updated = state.windows.map((win) => {
        if (win.isMinimized) return win;

        // Snapped windows: recalculate from snap layout
        if (win.isSnapped && win._snapSide) {
          const snap = snapLayout[win._snapSide];
          if (snap) {
            return {
              ...win,
              size: { width: snap.width, height: snap.height },
              position: { x: snap.x, y: snap.y },
            };
          }
        }

        // Maximized: nothing to do
        if (win.isMaximized) return win;

        // Unsnapped: scale position proportionally and clamp
        let nx = Math.round(win.position.x * (newW / oldW));
        let ny = Math.round(win.position.y * (newH / oldH));

        // Clamp: ensure header stays grabbable
        nx = Math.max(-win.size.width + HEADER_VISIBLE, Math.min(nx, newW - HEADER_VISIBLE));
        ny = Math.max(0, Math.min(ny, newH - 42));

        // If window is larger than viewport, shrink it
        const nw = Math.min(win.size.width, newW);
        const nh = Math.min(win.size.height, newH);

        if (
          nx === win.position.x &&
          ny === win.position.y &&
          nw === win.size.width &&
          nh === win.size.height
        ) {
          return win;
        }

        return {
          ...win,
          position: { x: nx, y: ny },
          size: { width: nw, height: nh },
        };
      });

      if (updated.some((w, idx) => w !== state.windows[idx])) {
        useWindowStore.setState({ windows: updated });
      }
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className={styles.manager}>
      <SnapOverlay side={snapPreview ? snapPreview.side : null} />
      {windows.map((w) => (
        <Window key={w.id} window={w} />
      ))}
    </div>
  );
}
