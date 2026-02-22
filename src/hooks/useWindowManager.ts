import { useState, useCallback } from 'react';
import { WindowInstance, WindowDefinition } from '../types';
import { MOBILE_BREAKPOINT } from '../store/constants';

/**
 * useWindowManager hook.
 * Manages the state and actions for windows.
 */
export function useWindowManager() {
  const [windows, setWindows] = useState<WindowInstance[]>([]);

  const openWindow = useCallback((windowDef: WindowDefinition) => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= MOBILE_BREAKPOINT;

    setWindows((prev) => {
      if (prev.some(w => w.id === windowDef.id)) {
        const sorted = [...prev].sort((a, b) => a.zIndex - b.zIndex);
        const others = sorted.filter(w => w.id !== windowDef.id);
        const target = prev.find(w => w.id === windowDef.id)!;

        const reordered = [...others, target];

        return reordered.map((w, index) => ({
          ...w,
          zIndex: index + 1,
          isMinimized: w.id === windowDef.id ? false : w.isMinimized
        }));
      }

      const sorted = [...prev].sort((a, b) => a.zIndex - b.zIndex);

      const inputAsInstance = windowDef as Partial<WindowInstance>;

      const { initialSize, initialPosition, ...restWindowDef } = windowDef;

      const newWindow: WindowInstance = {
        ...restWindowDef,
        zIndex: prev.length + 1,
        isMinimized: false,
        isMaximized: isWindowMaximized(isMobile, windowDef.isMaximized || false),
        isSnapped: inputAsInstance.isSnapped,
        size: inputAsInstance.size || initialSize || { width: 400, height: 300 },
        position: inputAsInstance.position || initialPosition || { x: 50, y: 50 },
      };

      const all = [...sorted, newWindow];
      return all.map((w, index) => ({ ...w, zIndex: index + 1 }));
    });
  }, []);

  const isWindowMaximized = (isMobile: boolean, isMaximizedByDefault: boolean) =>
    isMobile || isMaximizedByDefault;

  const closeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.filter(w => w.id !== id));
  }, []);

  const focusWindow = useCallback((id: string) => {
    setWindows((prev) => {
      const windowToFocus = prev.find(w => w.id === id);
      if (!windowToFocus) return prev;

      const sorted = [...prev].sort((a, b) => a.zIndex - b.zIndex);
      const others = sorted.filter(w => w.id !== id);
      const reordered = [...others, windowToFocus];

      return reordered.map((w, index) => ({
        ...w,
        zIndex: index + 1,
        isMinimized: w.id === id ? false : w.isMinimized
      }));
    });
  }, []);

  const updateWindow = useCallback((id: string, data: Partial<WindowInstance>) => {
    setWindows((prev) => prev.map(w => (w.id === id ? { ...w, ...data } : w)));
  }, []);

  return {
    windows,
    openWindow,
    closeWindow,
    focusWindow,
    updateWindow
  };
}
