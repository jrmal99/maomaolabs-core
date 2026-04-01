import { useContext } from 'react';
import { WindowStateContext } from '../../store/window-system-context';

export function useWindowState() {
  const context = useContext(WindowStateContext);
  if (context === null)
    throw new Error('useWindowState must be used within a WindowSystemProviderProvider');
  return context;
}
