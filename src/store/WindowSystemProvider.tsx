'use client';

import { ReactNode, useMemo, useState } from 'react';
import {
  WindowDispatchContext,
  WindowSnapContext,
  WindowStateContext,
} from './window-system-context';
import { useWindowManager } from '../hooks/useWindowManager';

type SnapSide = 'left' | 'right';

interface SnapPreview {
  side: SnapSide;
}

interface WindowSystemProviderProps {
  children: ReactNode;
}

export function WindowSystemProvider({ children }: WindowSystemProviderProps) {
  const windowManager = useWindowManager();
  const snapState = useSnapState();

  const dispatchContextValue = useWindowDispatch(windowManager);
  const snapContextValue = useSnapContext(snapState);

  return (
    <WindowStateContext.Provider value={windowManager.windows}>
      <WindowDispatchContext.Provider value={dispatchContextValue}>
        <WindowSnapContext.Provider value={snapContextValue}>
          {children}
        </WindowSnapContext.Provider>
      </WindowDispatchContext.Provider>
    </WindowStateContext.Provider>
  );
}

function useWindowDispatch(windowManager: ReturnType<typeof useWindowManager>) {
  return useMemo(
    () => ({
      openWindow: windowManager.openWindow,
      closeWindow: windowManager.closeWindow,
      focusWindow: windowManager.focusWindow,
      updateWindow: windowManager.updateWindow,
    }),
    [
      windowManager.openWindow,
      windowManager.closeWindow,
      windowManager.focusWindow,
      windowManager.updateWindow,
    ]
  );
}

function useSnapState() {
  const [snapPreview, setSnapPreview] = useState<SnapPreview | null>(null);

  return { snapPreview, setSnapPreview };
}

function useSnapContext(snapState: ReturnType<typeof useSnapState>) {
  return useMemo(
    () => snapState,
    [snapState.snapPreview]
  );
}
