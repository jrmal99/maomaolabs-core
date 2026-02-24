import { useWindowStore } from './windowStore';
import { WindowSystemProvider as WindowSystemProviderType } from '../types';

export type WindowDispatch = Omit<WindowSystemProviderType, 'windows' | 'snapPreview' | 'setSnapPreview'>;

/**
 * useWindowActions hook.
 * Provides access to window actions WITHOUT triggering re-renders on state changes.
 */
export function useWindowActions() {
  return useWindowStore((state) => ({
    openWindow: state.openWindow,
    closeWindow: state.closeWindow,
    focusWindow: state.focusWindow,
    updateWindow: state.updateWindow,
  }));
}

/**
 * useWindowSnap hook.
 * Provides access to snap preview state.
 */
export function useWindowSnap() {
  return useWindowStore((state) => ({
    snapPreview: state.snapPreview,
    setSnapPreview: state.setSnapPreview,
  }));
}

/**
 * useWindows hook.
 * Optimized hook for components that ONLY need the list of windows.
 */
export function useWindows() {
  return useWindowStore((state) => state.windows);
}
