# SCAS Agent Guidance

## Project Snapshot

- Smart Crop Advisory System (SCAS), currently a minimal Vite + React + TypeScript starter.
- Tailwind CSS 4 is enabled through `@tailwindcss/vite`; `lucide-react` is available for icons.
- The current entry point is [src/main.tsx](src/main.tsx), which renders [src/App.tsx](src/App.tsx).
- The starter UI remains in [src/App.tsx](src/App.tsx), [src/App.css](src/App.css), and [src/index.css](src/index.css); replace it incrementally as product surfaces are introduced.

## Commands

- `npm run dev` starts the Vite development server.
- `npm run build` runs the TypeScript project build and production Vite build.
- `npm run lint` runs ESLint across the workspace.
- `npm run preview` serves the production build locally.

Run `npm run lint` and `npm run build` after meaningful changes. There is no test runner configured yet; add focused tests when introducing data transformations, validation, or non-trivial interaction logic.

## Application Structure

- Keep route/page composition separate from reusable presentational components as the app grows. A reasonable destination is `src/components/` for shared UI and `src/features/<feature>/` for feature-specific screens, state, and types.
- Keep domain types and data contracts separate from JSX. Prefer `src/domain/` or the owning feature folder for TypeScript models and validation.
- Keep API/database adapters separate from components. Components should consume typed view models or hooks rather than constructing persistence queries.
- Preserve the existing Vite entry and TypeScript module settings unless a concrete requirement needs a change.

## SCAS Data Modeling

- Model core entities independently and normalize repeated facts: farms, fields, crops, seasons, soil observations, weather observations, advisories, and users/roles should have stable identifiers and explicit relationships.
- Use foreign keys in persistence models and explicit join entities for many-to-many relationships. Do not store repeated entity objects or comma-separated IDs in a record.
- Separate raw observations from derived recommendations. Store provenance, observation time, units, model/rule version, and created/updated timestamps where relevant.
- Use consistent units and enums at the domain boundary; validate external input before it reaches UI state or persistence code.
- Keep nullable fields intentional and document why a value may be absent. Define uniqueness and indexing rules from query needs, especially for field/season and time-series lookups.
- Treat database schemas and migrations as versioned artifacts. Do not silently change a persisted shape without a migration and updated TypeScript contracts.

## UI Conventions

- Build small, composable React components with typed props and accessible HTML semantics. Keep state close to the feature that owns it and avoid duplicating server/domain state in multiple components.
- Use Tailwind utilities for new styling where practical; keep global CSS for tokens, resets, and genuinely shared rules. Follow the existing project style until a deliberate design system is established.
- Use `lucide-react` icons inside icon buttons and provide accessible labels/tooltips. Every form control needs a visible label or an equivalent accessible name, plus clear validation and loading/error/empty states.
- Design for field workflows: clear hierarchy, scannable data, responsive layouts, keyboard access, and units shown beside numeric agricultural values. Avoid hiding critical advisory context behind decorative UI.
- Do not use placeholder starter content in finished product surfaces. Keep domain copy and display formatting close to the feature that owns them.

## Change Discipline

- Prefer the smallest cohesive change and follow nearby patterns before introducing abstractions or dependencies.
- Do not edit generated output or commit dependency churn unrelated to the task.
- When adding a dependency, update `package.json` and the lockfile together, then run the narrowest relevant validation followed by `npm run build`.
- Update [README.md](README.md) when setup, commands, or architecture become meaningfully different from the Vite starter description.