# @maomaolabs/core

> A standalone lightweight React library that brings a complete, performant, and responsive desktop window management experience to the web.

## Key Features

- **Uncompromised performance:** Zero unnecessary re-renders thanks to context splitting (`useWindows` vs `useWindowActions`).
- **Complete window lifecycle:** Seamlessly open, close, minimize, maximize, resize, and drag windows.
- **Built-in snapping:** Native-feeling edge snapping functionality (Windows Aero style).
- **Responsive design:** Automatically adapts interactions for mobile and desktop environments.
- **Out-of-the-box Toolbar:** A highly customizable taskbar handling both individual apps and folder groupings.

## Installation

Install via your preferred package manager (requires `react` and `react-dom` >= 18.0.0):

```bash
npm install @maomaolabs/core
# or
yarn add @maomaolabs/core
# or
pnpm add @maomaolabs/core
```

## Quick Start

Get a window running in under 30 seconds:

```tsx
import { WindowSystemProvider, WindowManager, useWindowActions } from '@maomaolabs/core';
import '@maomaolabs/core/dist/style.css'; // Critical for native feeling interactions

const AppLauncher = () => {
  const { openWindow } = useWindowActions();

  return (
    <button onClick={() => openWindow({ 
      id: 'hello', 
      title: 'Hello', 
      component: <div>World!</div> 
    })}>
      Launch App
    </button>
  );
};

export default function App() {
  return (
    <WindowSystemProvider>
      <WindowManager />
      <AppLauncher />
    </WindowSystemProvider>
  );
}
```

## Detailed Usage Guide

### Integrating the Toolbar
For a full desktop experience, include the `Toolbar` component to manage minimized windows and app launchers, including folder support.

```tsx
import { WindowSystemProvider, WindowManager, Toolbar } from '@maomaolabs/core';

const DESKTOP_ITEMS = [
  {
    id: 'browser-app',
    title: 'Browser',
    component: <div />, // Your app component
    initialSize: { width: 800, height: 600 }
  },
  {
    id: 'games-folder',
    title: 'Games',
    apps: [
      { id: 'minesweeper', title: 'Minesweeper', component: <div /> }
    ]
  }
];

export default function Desktop() {
  return (
    <WindowSystemProvider>
      <WindowManager />
      <Toolbar toolbarItems={DESKTOP_ITEMS} showLogo={true} />
    </WindowSystemProvider>
  );
}
```

### Accessing Window State
If you need to render UI based on currently open windows (e.g., a custom taskbar), use the `useWindows` hook. **Warning**: This triggers a re-render on any window state change (drag, resize, etc).

```tsx
import { useWindows } from '@maomaolabs/core';

const OpenAppCounter = () => {
  const windows = useWindows();
  return <div>Active apps: {windows.length}</div>;
};
```

## API Reference

### Core Components

| Component | Description | Props |
| :--- | :--- | :--- |
| `<WindowSystemProvider />` | Context provider required for the window system. Wrap your app with this. | `children: ReactNode` |
| `<WindowManager />` | Renders active windows and snap overlays. Must be inside the provider. | *None* |
| `<Toolbar />` | Renders the taskbar with app launchers and manages minimized windows. | `toolbarItems: ToolbarItem[]`, `showLogo?: boolean` |

### Core Hooks

**`useWindowActions()`**
Returns an object with methods to manipulate windows without subscribing to window state changes.
* `openWindow(window: WindowDefinition): void` - Opens a new window or focuses it if already open.
* `closeWindow(id: string): void` - Destroys a window instance.
* `focusWindow(id: string): void` - Brings a window to the top of the z-index stack.
* `updateWindow(id: string, data: Partial<WindowInstance>): void` - Patches an existing window's state.

**`useWindows()`**
* Returns: `WindowInstance[]` - The list of all currently active window instances.

**`useWindowSnap()`**
* Returns: `{ snapPreview: { side: 'left' | 'right' } | null, setSnapPreview: (preview: { side: 'left' | 'right' } | null) => void }`

### Interfaces

**`WindowDefinition`** (Used for opening windows)

| Property | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | **Required.** Unique identifier for the window instance. |
| `title` | `string` | **Required.** Text displayed in the window header. |
| `component` | `React.ReactNode` | **Required.** The view to be rendered inside the window. |
| `icon` | `React.ReactNode` | Optional element (e.g., SVG/image) for headers/toolbars. |
| `initialSize` | `{ width: number; height: number }` | Optional starting dimensions. |
| `initialPosition` | `{ x: number; y: number }` | Optional starting coordinates. |
| `layer` | `'base' \| 'normal' \| 'alwaysOnTop' \| 'modal'` | Window render priority layer. |
| `isMaximized` | `boolean` | If true, spawns the window spanning the screen. |
| `canMinimize` | `boolean` | Allows the user to hide the window. |
| `canMaximize` | `boolean` | Allows the user to toggle screen-spanning. |
| `canClose` | `boolean` | Allows the user to destroy the window. |

**`FolderDefinition`** (Used within Toolbars to group apps)

| Property | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | **Required.** Unique identifier for the folder. |
| `title` | `string` | **Required.** Folder name. |
| `apps` | `WindowDefinition[]` | **Required.** Array of windows contained within. |
| `icon` | `React.ReactNode` | Optional visual descriptor. |

*Note: `ToolbarItem` is a union type of `WindowDefinition | FolderDefinition`.*

## Configuration

This library does not use environment variables. Styling behavior is primarily managed via the required CSS import:

```tsx
import '@maomaolabs/core/dist/style.css';
```
Ensure your Vite/Webpack setup is configured to import and bundle CSS from `node_modules`.

## Contribution

We welcome PRs. To run locally:
1. `npm install`
2. `npm run dev` to watch changes and test locally.
3. `npm run test` before committing to ensure Vitest suites pass.

## License

MIT License. See `LICENSE` for more information.
