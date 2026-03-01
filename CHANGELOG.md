# Changelog 📖

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased] ✨

### ✨ Added
- **Theme Support (`systemStyle`)**: Window controls now support varied aesthetics adapting to `default`, `traffic` (colored dot buttons), `linux` (clean dark/light gradient), `yk2000` (classic 90s/00s retro) and **`aero` (translucent glass)** themes through CSS Modules.
- **Custom Style Injection**: Core UI components now officially accept `className` and `style` per window instance via the new `WindowStyling` type, injected through `openWindow()`.
- **`WindowStyling` type** (`src/types/index.ts`): Dedicated exported type `{ className?: string; style?: React.CSSProperties }` intersected into `WindowDefinition`. Replaces the previous `React.HTMLAttributes<HTMLDivElement>` extension, eliminating API surface collisions (e.g. `title`, `onMouseDown`) and narrowing the public contract to only what consumers should override.
- **Flexible Styling Types**: Refactored the rigid literal `SystemStyle` type union. It now uses `(string & {})`, preserving IDE autocompletion for built-in themes while permitting any arbitrary string as a custom `data-system-style` identifier.
- **Context Provider (`SystemStyleContext`)**: Added robust context propagation within `WindowSystemProvider` to cascade styles through component hierarchies reactively.
- **Utility `getSnapMap` (`src/components/window/snapMap.ts`)**: Decoupled and isolated coordinate calculation logic for window snapping into a pure utility function.
- **Granular Window Interfaces (`src/types/index.ts`)**: Refactored monolithic type definition into compositional interfaces (`WindowPresentation`, `WindowGeometry`, `WindowBehavior`, `WindowCore`) ensuring better extensibility and stricter typing.

### ♻️ Changed
- **`Window.tsx` Refactor**: Now consumes `useSystemStyle` context, reflecting its state into the actual DOM uniformly via the `data-system-style` attribute.
- **Style Overhaul (`Window.module.css` / `WindowControls.module.css`)**: Removed generic conditional and polluted class-based logic. Migrated to purely reactive global attribute selectors (`:global([data-system-style="..."])`).
- **Tree-Shaking Prevention**: Visual components (`Minimize.tsx`, `Maximize.tsx`, `Close.tsx`) have assigned direct CSS `.close`, `.minimize`, `.maximize` classes to ensure safelisting and avoid arbitrary code elimination during build processes.
- **Improved Declarations**: Refactored React base imports within `Window.tsx` replacing inline object referencing with clean destructured hooks and explicit aliasing syntax.
