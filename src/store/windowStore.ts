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

const getIsMobile = () => typeof window !== 'undefined' && window.innerWidth <= MOBILE_BREAKPOINT;

const bringToFront = (windows: WindowInstance[], id: string): WindowInstance[] => {
  const targetWindow = windows.find(w => w.id === id);
  if (!targetWindow) return windows;

  const sortedByZ = [...windows].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
  const others = sortedByZ.filter(w => w.id !== id);

  const newZOrder = [...others, targetWindow];
  const zIndexMap = new Map(newZOrder.map((w, index) => [w.id, index + 1]));

  return windows.map(w => ({
    ...w,
    zIndex: zIndexMap.get(w.id)!
  }));
};

export const useWindowStore = createStore<WindowState>((set) => ({
  windows: [],
  snapPreview: null,

  setSnapPreview: (preview) => set({ snapPreview: preview }),

  openWindow: (windowDef: WindowDefinition) => {
    set((state) => {
      const prev = state.windows;
      const existingWindow = prev.find(w => w.id === windowDef.id);

      if (existingWindow) {
        const updatedWindows = bringToFront(prev, windowDef.id);
        return {
          windows: updatedWindows.map(w =>
            w.id === windowDef.id ? { ...w, isMinimized: false } : w
          )
        };
      }

      const isMobile = getIsMobile();
      const { initialSize, initialPosition, ...restWindowDef } = windowDef;

      const payload = windowDef as Partial<WindowInstance>;

      const maxZIndex = prev.length > 0 ? Math.max(...prev.map(w => w.zIndex || 0)) : 0;

      const newWindow: WindowInstance = {
        ...restWindowDef,
        zIndex: maxZIndex + 1,
        isMinimized: false,
        isMaximized: isMobile || Boolean(windowDef.isMaximized),
        isSnapped: Boolean(payload.isSnapped),
        size: payload.size || initialSize || { width: 400, height: 300 },
        position: payload.position || initialPosition || { x: 50, y: 50 },
      };

      return { windows: [...prev, newWindow] };
    });
  },

  closeWindow: (id: string) => {
    set((state) => ({
      windows: state.windows.filter(w => w.id !== id)
    }));
  },

  focusWindow: (id: string) => {
    set((state) => {
      const exists = state.windows.some(w => w.id === id);
      if (!exists) return state;

      const updatedWindows = bringToFront(state.windows, id);
      return {
        windows: updatedWindows.map(w =>
          w.id === id ? { ...w, isMinimized: false } : w
        )
      };
    });
  },

  updateWindow: (id: string, data: Partial<WindowInstance>) => {
    set((state) => ({
      windows: state.windows.map(w => (w.id === id ? { ...w, ...data } : w))
    }));
  }
}));
