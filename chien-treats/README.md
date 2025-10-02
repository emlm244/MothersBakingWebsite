# Chien's Treats

Chien's Treats is a cozy, cartoon-inspired bakery experience focused on artisan macarons. The repo contains both the public storefront and the role-gated admin panel, powered entirely on the client with a swappable data provider (IndexedDB by default) so it works offline or without a backend.

## Quick start

`ash
pnpm install
pnpm dev
`

Open http://localhost:3000 for the storefront and http://localhost:3000/admin for the admin panel.

### Scripts

| Command | Description |
| --- | --- |
| pnpm dev | Run Next.js with hot reload |
| pnpm build | Production build |
| pnpm start | Start the production build |
| pnpm lint | ESLint (includes a11y & Tailwind plugins) |
| pnpm typecheck | TypeScript type checking |
| pnpm test | Vitest unit suite |
| pnpm test:watch | Vitest watch mode |
| pnpm test:e2e | Playwright smoke flow |
| pnpm seed | Export demo seed data to public/demo-seed.json |

## Tech stack

- Next.js App Router + React 19
- Redux Toolkit for global state
- React Hook Form + Zod for forms
- Tailwind CSS + design tokens (styles/tokens.css)
- Radix UI primitives and custom design system components (packages/ui)
- Dexie-backed IndexedDB data provider (packages/data/indexed-db-provider)
- Vitest/RTL, Playwright, axe-core integration in CI

## Design system & tokens

Tokens follow the PFP_Colors palette described in the brief and live in styles/tokens.css. Tailwind maps the CSS variables into theme extensions so design updates happen centrally.

## Data model

All entities (Product, Order, Review, Ticket, Coupon, etc.) are defined in packages/data/models.ts. The UI only talks to the DataProvider interface, keeping future REST/GraphQL integrations isolated.

## Integration points

See docs/INTEGRATIONS.md for the REST and Stripe contracts. The client currently uses:

- startCheckout to simulate Stripe demo payments
- DataProvider implementations for persistence (IndexedDB + in-memory fallback)

## Testing & quality

- Unit tests: pnpm test
- Playwright smoke tests: pnpm test:e2e
- Accessibility: lint rules + axe assertions in Playwright (extendable)
- CI (.github/workflows/ci.yml) runs lint, typecheck, unit, and e2e suites on pushes / PRs

## Deployment notes

1. Build with pnpm build
2. Serve with pnpm start
3. Seed demo data via Admin ? Dev Tools or pnpm seed (writes JSON for local import)

## Contributing

See CONTRIBUTING.md for workflow, branching, and Conventional Commits guidance. CODEOWNERS require one approval on main.

## License

MIT — see LICENSE.
