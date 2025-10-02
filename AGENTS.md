# Repository Guidelines

## Project Structure & Module Organization
- src/app/(site) holds customer-facing routes (home, shop, checkout, support) and src/app/(admin) serves the admin console.  Feature hooks and slices live in src/features/*, while presentational pieces sit in src/components.
- Design tokens, utilities, and providers are in packages/ (packages/ui for primitives, packages/data for IndexedDB + memory providers, packages/emails for React Email templates). Automated docs live in docs/.
- Tests reside beside features (unit) and under 	ests/e2e for Playwright smoke coverage. Scripts and tooling are in scripts/.

## Build, Test, and Development Commands
- pnpm dev — start the Next.js dev server with hot reload.
- pnpm typecheck — run TypeScript in no-emit mode.
- pnpm lint — execute ESLint with a11y and Tailwind plugins.
- pnpm test / pnpm test:watch — run Vitest suites once or in watch mode.
- pnpm test:e2e — launch Playwright smoke flows (installs browsers if missing).
- pnpm seed — export seed data to public/demo-seed.json for local debugging.

## Coding Style & Naming Conventions
- TypeScript + React (App Router) with strict mode; prefer function components and hooks.
- Follow Tailwind tokens (styles/tokens.css) and design primitives from packages/ui.
- Use 2-space indentation, kebab-case for route folders, PascalCase for components, camelCase for variables/functions.
- Run pnpm lint before committing; formatting is handled by Tailwind class ordering and ESLint rules.

## Testing Guidelines
- Unit tests: Vitest + Testing Library (*.test.ts[x]). Keep assertions focused and colocate with the feature.
- E2E: Playwright specs under 	ests/e2e (naming *.spec.ts). Maintain coverage for key flows: shop ? checkout, review approval, ticket lifecycle.
- Aim for =80% statement coverage and ensure new flows have smoke coverage or axe checks when applicable.

## Commit & Pull Request Guidelines
- Use Conventional Commits (eat:, ix:, chore:). Attach context in the subject and keep messages imperative.
- PRs must include problem, solution, a11y notes, and validation steps per .github/PULL_REQUEST_TEMPLATE.md. Link issues where relevant, and ensure CI (lint, typecheck, unit, e2e) is green before requesting review.
