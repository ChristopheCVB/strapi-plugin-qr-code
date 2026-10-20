# Repository Guidelines

## Project Structure & Module Organization

This package provides a QR code panel for Strapi v5 content entries.
- `admin/src/`: React/TypeScript plugin registration, `components/QRCodePanel.tsx`, QR export utilities, and translation JSON files.
- `server/src/`: plugin lifecycle hooks, routes, controllers, services, and Zod configuration validation in `config/index.ts`.
- `server/src/__tests__/`: server unit tests.
- `assets/`: README logo and preview images.
- `dist/`: generated package output; edit source files instead.
- `.github/workflows/`: pull request checks and release automation.

## Build, Test, and Development Commands

Use Node 22 (minimum `22.22.1`) and the pnpm version pinned in `package.json`. Initialize with `mise trust`, `mise install`, and `pnpm install --frozen-lockfile`.

- `pnpm watch`: rebuild the plugin during development.
- `pnpm watch:link`: watch with the Strapi SDK's linking workflow for a consuming application.
- `pnpm build`: compile admin and server package outputs.
- `pnpm verify`: validate the built package.
- `pnpm typecheck:front` / `pnpm typecheck:back`: check admin/server TypeScript.
- `pnpm lint` / `pnpm lint:fix`: check or automatically fix ESLint violations.
- `pnpm test --run`: run tests once, matching CI.
- `pnpm test:watch` / `pnpm test:coverage`: watch tests or generate V8 coverage reports.

## Coding Style & Naming Conventions

Follow `eslint.config.mjs`: two-space indentation, single quotes, no semicolons, multiline trailing commas, and LF line endings. ESLint handles style; no separate formatter is configured. Use PascalCase for React components and camelCase for functions and variables. Follow neighboring filenames. Reuse `getTranslation`, `qrToEPS`, and the existing `PLUGIN_ID` constants. Prefer Strapi design-system components for admin UI.

## Testing Guidelines

Vitest runs in Node and discovers `server/src/__tests__/**/*.test.ts`. Use descriptive `describe`/`it` cases; follow `config.test.ts` for valid and rejected configuration examples. Add regression tests for server behavior changes. Coverage targets server source; no minimum percentage is configured. For UI changes, manually verify the panel and affected downloads in a Strapi application.

## Commit & Pull Request Guidelines

Use Conventional Commits, matching history: `feat: ...`, `fix(ci): ...`, or `chore(deps): ...`. Target `main`. Describe the problem, resulting behavior, related issues, and validation performed; include screenshots for UI changes. Update README configuration examples when behavior changes. Before submitting, run both typechecks, lint, tests, build, and verify, matching CI.
