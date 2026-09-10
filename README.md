# Weblio

Weblio is the frontend foundation for a professional no-code website builder. It provides a cohesive mocked journey from custom authentication through project management to a responsive visual editor and chrome-free preview.

## Prerequisites

- Node.js 20 or newer
- npm 10 or newer

## Getting started

```bash
npm install
npm run dev
```

The development server runs at `http://localhost:3000` and uses SPA history fallback.

## Quality commands

| Command | Purpose |
| --- | --- |
| `npm run build` | Create an optimized, hashed production bundle |
| `npm run typecheck` | Run strict TypeScript validation |
| `npm run lint` | Run Biome lint and formatting checks |
| `npm run format` | Apply Biome formatting |
| `npm test` | Run the Vitest behavior suite |

## Architecture

The source tree is intentionally flat. Product components live in `src/components`, application-level hooks in `src/hooks`, canonical domain types in `src/types`, pure document operations in `src/lib`, Zustand stores in `src/store`, and design-system foundations in `src/styles`. Each folder exposes a deliberate barrel API where it is consumed as a public module.

The editor stores a normalized, versioned `WebsiteDocument`: elements are serializable records with stable identifiers, explicit parent/child relationships, discriminated element types, and cascading desktop/tablet/mobile styles. `WebsiteRenderer` consumes that model in both the visual canvas and preview. Editor-only selection and resize chrome are optional renderer concerns and never enter persisted website content.

Zustand owns shared document, selection, history, viewport, theme, and project state. Local interaction state—such as the publish simulation—stays within its component. History records only document mutations and remains bounded. The canvas uses selectors where practical and pointer events for canvas resizing; keyboard commands are centralized in one hook.

Webpack compiles React 19.2 and strict TypeScript through Babel with React Compiler enabled. Production builds use deterministic module IDs, hashed assets, runtime extraction, shared chunking, filesystem caching, and source maps. Product boundaries are ready for route-level lazy loading as each area grows.

## Design system and accessibility

Semantic CSS custom properties define surfaces, text, borders, state colors, radii, focus, and shadow behavior. The editor supports an independently persisted light/dark chrome theme; it does not change authored website colors. Controls use native interactive elements, visible keyboard focus, accessible names, reduced-motion handling, explicit form labels, and a desktop guidance state for the advanced editor.

Place supplied Inter font files in `public/fonts`. The stylesheet uses local Inter when available and a metric-conscious system fallback without making an external font request.

## Frontend-only boundaries

Authentication, publishing, and project persistence are intentionally labeled mock behavior. Authentication stores only a demo session marker. Projects and preferences use versioned local browser persistence, not a database. Publishing reports a local preview state and never claims deployment.

Future Clerk integration should replace the small mock auth store and protected-route session source while retaining the custom screens. A future backend can load and save the existing `WebsiteProject` and `WebsiteDocument` contracts directly after validating and migrating persisted payloads; no speculative service or API layer exists today.

Remote image URLs are sample content only. Production asset upload, image transformation, collaborative editing, and real deployment remain explicit future integrations.
