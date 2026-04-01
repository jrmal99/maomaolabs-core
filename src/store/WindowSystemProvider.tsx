'use client';

import { ReactNode, createContext, useContext } from 'react';

import '../styles/themes/traffic.css';
import '../styles/themes/linux.css';
import '../styles/themes/yk2000.css';
import '../styles/themes/aero.css';

export type SystemStyle = (string & {}) | 'default' | 'traffic' | 'linux' | 'yk2000' | 'aero';

const SystemStyleContext = createContext<SystemStyle>('default');

export function useSystemStyle() {
  return useContext(SystemStyleContext);
}

interface WindowSystemProviderProps {
  children: ReactNode;
  systemStyle?: SystemStyle;
}

export function WindowSystemProvider({
  children,
  systemStyle = 'default',
}: WindowSystemProviderProps) {
  return <SystemStyleContext.Provider value={systemStyle}>{children}</SystemStyleContext.Provider>;
}
