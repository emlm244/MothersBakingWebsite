# Architecture Overview

## App composition

- Next.js App Router with route groups /(site) and /(admin).
- Global providers wire up Redux Toolkit (cart/session/ticketing) and a swappable data provider (IndexedDB default, in-memory fallback).
- Feature modules (src/features/*) encapsulate hooks and slices for cart, reviews, ticketing, etc.
- Design system components live in packages/ui for reuse across customer and admin surfaces.
- Shared data contracts and persistence implementations live in packages/data (Dexie IndexedDB + in-memory provider).

## Data flow

1. UI layers call feature hooks (e.g. useCartSummary, useTickets).
2. Hooks coordinate Redux state and the DataProvider abstraction.
3. The provider persists to IndexedDB via Dexie. DataProviderProvider seeds demo content on first load and falls back to the in-memory provider when IndexedDB is unavailable (e.g., during SSR).
4. Actions that mimic backend integration (checkout, tickets) call the provider through thin library helpers such as startCheckout.

## State management

- Redux Toolkit slices: cart, session, ticketing.
- Form state handled with React Hook Form + Zod.
- Minimal derived state is memoised inside hooks to keep components declarative.

## Styling & accessibility

- Tailwind CSS with tokenised CSS variables defined in styles/tokens.css.
- Radix primitives for dialogs/select/toasts, and custom utilities for focus management.
- Typography is controlled with @tailwindcss/typography for content blocks.

## Testing & tooling

- Vitest + React Testing Library for unit tests (pnpm test).
- Playwright for smoke end-to-end coverage (pnpm test:e2e).
- CI runs lint, typecheck, unit, and E2E suites.

## Directory layout

`
src/
  app/            Route groups for site and admin experiences
    (site)/      Customer-facing routes (/, shop, checkout, support, etc.)
    (admin)/admin/  Admin console routes (/admin, /admin/products, ... )
  components/     Reusable UI pieces (product cards, review cards)
  features/       Feature-specific logic (cart, reviews, ticketing, newsletter)
  lib/            Shared utilities (data provider context, visuals, payments)
  store/          Redux store and hooks
packages/
  data/           Data contracts, providers, seeding utilities
  ui/             Design system primitives
scripts/          Tooling helpers (e.g., demo seed export)
`

## Future backend integration

- packages/data/rest-provider is left as a seam for wiring to REST APIs.
- Stripe integration stubs live in src/lib/payments ready for real keys/server endpoints.
- All data access goes through DataProvider, so swapping implementations requires no component changes.

