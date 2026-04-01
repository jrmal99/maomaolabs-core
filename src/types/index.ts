import React from 'react';
import { SystemStyle } from '../store/WindowSystemProvider';

/**
 * WindowDefinition type.
 * Defines the properties of a window.
 */

export type WindowPresentation = {
  title: string;
  icon?: React.ReactNode;
  component: React.ReactNode;
};

/**
 * WindowStyling type.
 * Allows consumers to inject custom className and style into the window container.
 * Kept separate from WindowPresentation to avoid collisions with HTML attribute names (e.g. `title`).
 */
export type WindowStyling = {
  className?: string;
  style?: React.CSSProperties;
};

export type WindowGeometry = {
  initialSize?: { width: number; height: number };
  initialPosition?: { x: number; y: number };
};

export type WindowBehavior = {
  canMinimize?: boolean;
  canMaximize?: boolean;
  canClose?: boolean;
};

export type WindowCore = {
  id: string;
  layer?: 'base' | 'normal' | 'alwaysOnTop' | 'modal';
  isMaximized?: boolean;
};

export type WindowDefinition = WindowCore &
  WindowPresentation &
  WindowGeometry &
  WindowBehavior &
  WindowStyling;

export type FolderDefinition = {
  id: string;
  title: string;
  icon?: React.ReactNode;
  apps: WindowDefinition[];
};

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
  /** Which snap zone the window is in (for browser resize recalculation). */
  _snapSide?:
    | 'top'
    | 'left'
    | 'right'
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
    | null;
  /** Size before snapping (restored on unsnap). */
  _preSnapSize?: { width: number; height: number } | null;
  zIndex: number;
};

/**
 * WindowSystemProvider type.
 * Defines the properties of the window store.
 */
export type WindowSystemProvider = {
  windows: WindowInstance[];
  snapPreview: {
    side: 'top' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  } | null;
  setSnapPreview: (
    preview: {
      side: 'top' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    } | null,
  ) => void;
  openWindow: (window: WindowDefinition) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindow: (id: string, data: Partial<WindowInstance>) => void;
  systemStyle?: SystemStyle;
};

export type WindowProps = {
  window: WindowInstance;
};

export type WindowHeaderProps = {
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  canMinimize?: boolean;
  canMaximize?: boolean;
  canClose?: boolean;
};

export type WindowContextState = {
  size: { width: number; height: number };
  position: { x: number; y: number };
  isDragging: boolean;
  isResizing: boolean;
  drag: (e: React.MouseEvent) => void;
  resize: (e: React.MouseEvent) => void;
  isMinimized: boolean;
  isMaximized: boolean;
  isSnapped: boolean;
  minimize: () => void;
  maximize: () => void;
  restore: () => void;
  windowRef: React.RefObject<HTMLDivElement>;
};
