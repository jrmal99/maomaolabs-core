import { createStore } from './createStore';
import { WindowInstance, WindowDefinition } from '../types';
import { MOBILE_BREAKPOINT } from './constants';

type SnapSide = 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

interface WindowState {
  windows: WindowInstance[];
  snapPreview: { side: SnapSide } | null;
  setSnapPreview: (preview: { side: SnapSide } | null) => void;
  openWindow: (windowDef: WindowDefinition) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindow: (id: string, data: Partial<WindowInstance>) => void;
}

const isWindowMaximized = (isMobile: boolean, isMaximizedByDefault: boolean) =>
  isMobile || isMaximizedByDefault;

export const useWindowStore = createStore<WindowState>((set, get) => ({
  windows: [],
  snapPreview: null,

  setSnapPreview: (preview) => set({ snapPreview: preview }),

  openWindow: (windowDef: WindowDefinition) => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= MOBILE_BREAKPOINT;

    set((state) => {
      const prev = state.windows;
      if (prev.some(w => w.id === windowDef.id)) {
        const sorted = [...prev].sort((a, b) => a.zIndex - b.zIndex);
        const others = sorted.filter(w => w.id !== windowDef.id);
        const target = prev.find(w => w.id === windowDef.id)!;

        const reordered = [...others, target];

        return {
          windows: reordered.map((w, index) => ({
            ...w,
            zIndex: index + 1,
            isMinimized: w.id === windowDef.id ? false : w.isMinimized
          }))
        };
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
      return { windows: all.map((w, index) => ({ ...w, zIndex: index + 1 })) };
    });
  },

  closeWindow: (id: string) => {
    set((state) => ({
      windows: state.windows.filter(w => w.id !== id)
    }));
  },

  focusWindow: (id: string) => {
    set((state) => {
      const prev = state.windows;
      const windowToFocus = prev.find(w => w.id === id);
      if (!windowToFocus) return { windows: prev }; // no state change

      const sorted = [...prev].sort((a, b) => a.zIndex - b.zIndex);
      const others = sorted.filter(w => w.id !== id);
      const reordered = [...others, windowToFocus];

      return {
        windows: reordered.map((w, index) => ({
          ...w,
          zIndex: index + 1,
          isMinimized: w.id === id ? false : w.isMinimized
        }))
      };
    });
  },

  updateWindow: (id: string, data: Partial<WindowInstance>) => {
    set((state) => ({
      windows: state.windows.map(w => (w.id === id ? { ...w, ...data } : w))
    }));
  }
}));
