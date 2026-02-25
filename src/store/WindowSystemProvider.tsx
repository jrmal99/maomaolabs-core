'use client';

import React, { ReactNode } from 'react';

interface WindowSystemProviderProps {
  children: ReactNode;
}

export function WindowSystemProvider({ children }: WindowSystemProviderProps) {
  return <>{children}</>;
}
