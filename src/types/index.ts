
import React from 'react';

/**
 * WindowDefinition type.
 * Defines the properties of a window.
 */

export type WindowDefinition = {
  id: string;
  title: string;
  icon?: React.ReactNode;
  component: React.ReactNode;
  initialSize?: { width: number; height: number };
  initialPosition?: { x: number; y: number };
  layer?: 'base' | 'normal' | 'alwaysOnTop' | 'modal';
  isMaximized?: boolean;
  canMinimize?: boolean;
  canMaximize?: boolean;
  canClose?: boolean;
}

export type FolderDefinition = {
  id: string;
  title: string;
  icon?: React.ReactNode;
  apps: WindowDefinition[];
}

export type ToolbarItem = WindowDefinition | FolderDefinition;

/**
 * WindowInstance type.
 * Defines the properties of a window instance.
 */
export type WindowInstance = Omit<WindowDefinition, 'initialSize' | 'initialPosition'> & {
  size: { width: number; height: number };
  position: { x: number; y: number };
  isMinimized?: boolean;
  isMaximized?: boolean;
  isSnapped?: boolean;
  zIndex: number;
}

/**
 * WindowSystemProvider type.
 * Defines the properties of the window store.
 */
export type WindowSystemProvider = {
  windows: WindowInstance[];
  snapPreview: { side: 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' } | null;
  setSnapPreview: (preview: { side: 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' } | null) => void;
  openWindow: (window: WindowDefinition) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindow: (id: string, data: Partial<WindowInstance>) => void;
};

export type WindowProps = {
  window: WindowInstance
}

export type WindowHeaderProps = {
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  canMinimize?: boolean;
  canMaximize?: boolean;
  canClose?: boolean;
}

export type WindowContextState = {
  size: { width: number; height: number }
  position: { x: number; y: number }
  isDragging: boolean
  isResizing: boolean
  drag: (e: React.MouseEvent) => void
  resize: (e: React.MouseEvent) => void
  isMinimized: boolean
  isMaximized: boolean
  isSnapped: boolean
  minimize: () => void
  maximize: () => void
  restore: () => void
  windowRef: React.RefObject<HTMLDivElement>
}
