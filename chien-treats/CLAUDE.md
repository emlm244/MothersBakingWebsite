# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Frontend (Next.js)
```bash
pnpm dev                # Run Next.js dev server (http://localhost:3000)
pnpm build              # Production build
pnpm start              # Start production build
pnpm lint               # ESLint with a11y & Tailwind plugins
pnpm typecheck          # TypeScript type checking
pnpm test               # Vitest unit tests
pnpm test:watch         # Vitest watch mode
pnpm test:e2e           # Playwright E2E tests
pnpm test:e2e:ui        # Playwright UI mode
pnpm seed               # Export demo seed data to public/demo-seed.json
```

### Backend API (NestJS + Fastify)
```bash
pnpm api:dev            # Run API dev server with hot reload (tsx watch)
pnpm api:build          # Build API to apps/api/dist
pnpm api:start          # Start built API
pnpm api:lint           # ESLint for API code
pnpm api:typecheck      # TypeScript check for API
pnpm api:test           # Vitest unit tests for API
pnpm api:test:watch     # API tests in watch mode
pnpm api:coverage       # Generate coverage report
pnpm api:migrate        # Run Prisma migrations
pnpm api:seed           # Seed API database
```

## Architecture Overview

This monorepo contains **Chien's Treats** - a bakery e-commerce platform with both client-only and full-stack configurations.

### Dual Architecture

The app supports **two deployment modes**:

1. **Client-only mode** (original): Next.js frontend using IndexedDB/memory data providers for offline/demo usage
2. **Full-stack mode** (new): Next.js frontend + NestJS/Fastify REST API + Prisma/PostgreSQL backend

### Frontend Structure (Next.js 15 + React 19)

**Route groups:**
- `app/(site)/` - Customer-facing pages (shop, gallery, support, contact, etc.)
- `app/(admin)/admin/` - Admin console (products, orders, reviews, tickets, dev tools)
- `app/login/`, `app/register/`, `app/verify-email/` - Authentication flows

**State management:**
- Redux Toolkit slices in `src/store/`: cart, session, ticketing, auth
- React Hook Form + Zod for forms
- Feature modules in `src/features/` encapsulate hooks and slices

**Data Provider Pattern:**
The UI interacts exclusively through the `DataProvider` interface (`packages/data/provider.ts`), enabling seamless swapping between:
- `indexed-db-provider.ts` - Dexie/IndexedDB (client-only mode)
- `memory-provider.ts` - In-memory fallback
- `rest-provider.ts` - REST API client (full-stack mode)

The active provider is configured in `src/lib/data-provider.tsx`. Currently uses `restProvider` to connect to the NestJS backend.

**Path aliases (tsconfig.json):**
```
@/* → src/*
@data → packages/data/index.ts
@ui → packages/ui/index.ts
@config → packages/config/index.ts
@emails → packages/emails/index.ts
```

### Backend Structure (NestJS + Fastify + Prisma)

**Location:** `apps/api/`

**Key modules:**
- `auth/` - JWT authentication with Passport, argon2 password hashing, email verification
- `modules/products/`, `modules/orders/`, `modules/reviews/`, `modules/coupons/`, `modules/tickets/` - Core domain logic
- `modules/content/` - CMS content blocks
- `modules/payments/` - Stripe integration (webhooks, checkout sessions)
- `modules/search/` - Product search functionality
- `common/` - Shared filters (problem-details), interceptors (metrics), decorators, pipes
- `prisma/` - Database schema and client
- `storage/` - File upload handling
- `mailer/` - Email sending with React Email templates
- `metrics/` - Prometheus metrics via prom-client
- `health/` - Health check endpoints (healthz, readyz)
- `redis/` - Redis integration for caching/sessions
- `events/` - EventEmitter for domain events

**API conventions:**
- Base URL: `/api/v1/*` (configurable via `app.setGlobalPrefix`)
- Health endpoints: `/healthz`, `/readyz`, `/metrics` (no `/api/v1` prefix)
- Swagger docs: `/api/v1/docs` (disabled in production)
- Authentication: JWT Bearer tokens
- Error handling: RFC 7807 Problem Details format
- Validation: Zod schemas via nestjs-zod
- Rate limiting: Fastify rate-limit plugin (100 req/5min default)

**Database:** PostgreSQL via Prisma ORM
- Schema: `apps/api/prisma/schema.prisma`
- User roles: guest, customer, staff, support, admin
- Models: User, Product, Review, Coupon, Order, Ticket, ContentBlock, RefreshToken, EmailLog, AuditLog, EmailVerificationToken

### Shared Packages

**packages/data/** - Data contracts and providers
- `models.ts` - TypeScript types for all entities (Product, Order, Review, Ticket, Coupon, etc.)
- `provider.ts` - DataProvider interface contract
- Implementations: indexed-db-provider, memory-provider, rest-provider

**packages/ui/** - Design system components (shared across customer/admin)
- Radix UI primitives wrapped with custom styles
- Uses Tailwind with CSS variables from `styles/tokens.css`

**packages/config/** - Shared configuration utilities

**packages/emails/** - React Email templates
- Transactional email components (email verification, order confirmations, etc.)
- Previews available in Admin → Dev Tools

### Design System

**Tokens:** `styles/tokens.css` defines CSS variables following the PFP_Colors palette
**Tailwind:** Maps CSS variables into theme extensions for centralized design updates
**Typography:** `@tailwindcss/typography` for content blocks
**Accessibility:** eslint-plugin-jsx-a11y + axe-core in Playwright tests

## Testing

**Unit tests (Vitest):**
- Frontend: `pnpm test` (src/\*\*/\*.test.ts(x))
- API: `pnpm api:test` (apps/api/src/\*\*/\*.test.ts)

**E2E tests (Playwright):**
- `pnpm test:e2e` - Headless smoke flows
- `pnpm test:e2e:ui` - Interactive UI mode
- Includes axe-core accessibility assertions

**CI (.github/workflows/ci.yml):**
1. Lint (frontend + API)
2. Typecheck (frontend + API)
3. Unit tests (frontend + API)
4. E2E tests

## Working with the API

**Environment setup:**
The API requires environment variables (see apps/api/.env.example):
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `REDIS_URL` - Redis connection (optional)
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` - Stripe integration
- `SMTP_*` - Email configuration

**Database workflow:**
```bash
# Generate Prisma client after schema changes
cd apps/api && npx prisma generate

# Create and run migrations
npx prisma migrate dev --name description

# Deploy migrations in production
pnpm api:migrate

# Seed the database
pnpm api:seed
```

**Adding API endpoints:**
1. Define Zod DTOs in `modules/*/dto/*.dto.ts`
2. Implement service logic in `modules/*/\*.service.ts`
3. Add controller endpoints in `modules/*/\*.controller.ts`
4. Register module in `app.module.ts` if new
5. Use decorators: `@Public()` for unauthenticated routes, `@Roles()` for authorization

## Integration Points

**Stripe:**
- Checkout sessions: POST `/api/v1/payments/stripe/create-checkout-session`
- Webhooks: POST `/api/v1/payments/stripe/webhook` (uses rawBody)
- Demo mode: `startCheckout(orderDraft, { demo: true })` marks orders paid without Stripe

**Email:**
- Templates defined in `packages/emails/`
- Sent via nodemailer in `apps/api/src/mailer/`
- Logged to EmailLog table

## Common Workflows

**Adding a new product field:**
1. Update `packages/data/models.ts` (TypeScript types)
2. Update `apps/api/prisma/schema.prisma` (if using full-stack)
3. Run `npx prisma migrate dev` (if schema changed)
4. Update IndexedDB provider schema in `packages/data/indexed-db-provider.ts`
5. Update forms/components that display/edit products

**Creating a new admin page:**
1. Add route in `src/app/(admin)/admin/[page]/page.tsx`
2. Use `<RequireRole role="admin">` or similar guards
3. Access data via `useDataProvider()` hook
4. Integrate with Redux if global state needed

**Switching data providers:**
Edit `src/lib/data-provider.tsx` to change the imported provider (indexedDbProvider, memoryProvider, or restProvider).
