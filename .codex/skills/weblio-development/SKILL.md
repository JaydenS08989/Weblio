---
name: weblio-development
description: Apply Weblio's repository-specific React, TypeScript, Zustand, CSS, architecture, public-module, and production-quality conventions. Use whenever creating, moving, reviewing, refactoring, or formatting application source or configuration in the Weblio repository.
---

# Develop Weblio

## Preserve the product

- Preserve existing behavior, JSX, components, state, shared types, styles, and configuration unless the task explicitly requires a functional change.
- Never delete or rename an existing CSS class merely for cleanup. Change a class only to fix a genuine issue and update every consumer.
- Prefer a direct correction over a broad stylistic rewrite. Do not introduce speculative services, repositories, factories, wrappers, duplicate utilities or types, or abstractions used by one trivial call site.
- Produce strict, accessible, maintainable, production-quality TypeScript and React. Keep authentication, persistence, publishing, and other intentionally local/demo boundaries honest.
- Do not add testing infrastructure; this repository intentionally has none.

## Respect the architecture

Use each source directory for its defined responsibility:

- `src/pages`: route-level screens and complete application views such as `AuthPage`, `DashboardPage`, `EditorPage`, and `PreviewPage`.
- `src/components`: reusable UI and editor building blocks.
- `src/hooks`: reusable React hooks.
- `src/store`: Zustand application state and persistence.
- `src/lib`: framework-independent browser utilities and domain logic.
- `src/types`: shared TypeScript contracts.
- `src/styles`: global and shared CSS.

Keep `src/App.tsx` responsible for route composition and `src/index.tsx` responsible for browser initialization. Do not classify a component as a page merely because it is large. Avoid unnecessary nesting.

## Maintain public module boundaries

Expose the intended public API of every applicable directory through its `index.ts`. Add a moved or new public module to its barrel, remove stale exports, and mark type-only exports with `export type`. Keep implementation details private when external consumers do not need them.

Import public modules through directory aliases:

```ts
import { ComponentName } from "@/components";
import { PageName } from "@/pages";
import { useEditorStore } from "@/store";
import { utility } from "@/lib";

import type { SomeType } from "@/types";
```

Do not bypass barrels:

```ts
import ComponentName from "@/components/ComponentName";
import PageName from "@/pages/PageName";
import { useEditorStore } from "@/store/editorStore";
```

Use `@/components`, `@/pages`, `@/hooks`, `@/lib`, `@/store`, and `@/types` for cross-directory imports. Relative imports are appropriate only for a module's private, tightly coupled same-directory implementation. Before adding an export or barrel import, check for circular dependencies; stores may depend on `lib` and `types`, while domain utilities must not depend on React components or stores.

## Follow React and TypeScript conventions

- Import React as `import React from "react";` when the React namespace is needed. Import the DOM client in the established entry-point form: `import * as ReactDOM from "react-dom/client";`.
- Use function components, typed props, semantic JSX, native controls, accessible names, and the existing `React.FC` convention.
- Keep reusable interaction logic in hooks, shared state in Zustand, and truly local interaction state in its component.
- In Zustand stores, define a typed state interface, use selectors when a component needs only part of a store, keep state mutations immutable, and keep persistence configuration next to store creation. Persist only durable state; do not move transient UI state into storage without a product requirement.
- Preserve strict TypeScript. Add explicit types when they improve contracts or readability, but avoid annotations TypeScript can safely infer. Use `import type` for type-only dependencies and reuse canonical contracts from `@/types`.
- Use PascalCase for components and shared interfaces/types, camelCase for variables and functions, and `use` prefixes for hooks and Zustand stores.

## Organize imports and whitespace

Treat `src/index.tsx` as the formatting model:

```tsx
import "@/styles/index.css";

import React from "react";
import * as ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";

const rootElement = document.getElementById("root");
```

Keep side-effect style imports first, then external runtime imports, then aliased/local runtime imports, followed by a blank line and type-only imports where present. Let Biome organize imports when its result respects public boundaries.

Add one sensible blank line between declarations, state/hooks, handlers, derived calculations, and returned JSX. Add whitespace between meaningful JSX sections so screens scan clearly, but keep tightly related statements together. Use two-space indentation and Biome's formatting output across TypeScript, TSX, CSS, JSON, and configuration files.

## Write and maintain CSS

Keep global/shared styles in `src/styles`. Reuse existing custom properties and classes before adding variants. Preserve responsive behavior, focus styling, reduced-motion handling, and theme behavior. Group related selectors and declarations with readable spacing; do not rename selectors for stylistic preference.

## Maintain configuration and language

Keep configuration direct, typed where useful, and consistent with the `@/*` alias in TypeScript and Webpack. Do not add a tool, plugin, dependency, or new configuration layer without a concrete need. Update lockfiles whenever dependencies change.

Use professional US English in identifiers, comments, documentation, labels, and new text: `organize`, `behavior`, `color`, `center`, and `customize`. Do not alter standards-defined CSS properties, external APIs, or third-party identifiers.

## Complete changes safely

1. Inspect neighboring code and the relevant barrel before editing.
2. Make the smallest coherent architectural or behavioral change.
3. Update exports and all consumers when moving public modules.
4. Format with Biome, run its linter, run strict TypeScript checking, and build production output.
5. Search for stale deep imports, old paths, circular dependency symptoms, conflict markers, removed infrastructure, and non-US spelling.
6. Review the diff to confirm functionality and all existing CSS classes remain intact unless the task explicitly required otherwise.
