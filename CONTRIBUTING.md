# Contributing

Thanks for helping shape Chien's Treats! This repo follows Conventional Commits and a lightweight trunk-based flow.

## Workflow

1. Create a branch from main using 	ype/short-description, e.g. eat/ticketing-filters.
2. Run pnpm install if dependencies change.
3. Keep work incremental; open draft PRs early for feedback.
4. Ensure pnpm lint, pnpm typecheck, pnpm test, and pnpm test:e2e pass locally.
5. Update docs/tests alongside code changes.
6. Use Conventional Commit messages (e.g., eat: add ticket status filters).
7. Open a PR and complete the template (tests, a11y notes, validation steps). One approval + green CI is required.

## Coding guidelines

- Prefer feature modules in src/features/* to keep logic close to use.
- All data access goes through the DataProvider abstraction.
- Use the design system components in packages/ui before introducing new primitives.
- Keep accessibility top-of-mind: keyboard flows, focus states, and ARIA where necessary.

## Testing

- Unit tests live next to the feature (*.test.ts[x]). Use Vitest + Testing Library.
- Smoke e2e tests belong in 	ests/e2e with Playwright.
- Consider adding axe assertions when building new flows.

## Docs

- Update docs/ASSUMPTIONS.md when operating under non-final product guidance.
- Document new APIs or endpoints in docs/INTEGRATIONS.md.

Happy baking! ??
