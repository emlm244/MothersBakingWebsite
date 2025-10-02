# Integration contracts

## Stripe (placeholder)

- POST /payments/stripe/create-checkout-session ? { url: string }
- POST /payments/stripe/webhook updates order status.
- Env vars: STRIPE_PUBLIC_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET.

Current implementation uses startCheckout(orderDraft, { demo: true }) to mark demo orders as paid.

## REST API seam

packages/data/provider.ts documents the methods required for a backend implementation. The planned REST provider expects endpoints:

- GET /products, POST /products, PATCH /products/:id
- GET /orders, PATCH /orders/:id
- GET /reviews, PATCH /reviews/:id
- GET /tickets, POST /tickets, PATCH /tickets/:id
- GET /coupons, PUT /coupons/:code

Requests will use JWT auth (bearer tokens). Pagination uses ?page and ?limit query parameters.

## Email

Transactional emails are defined in packages/emails (React Email templates). In this code-only drop, previews are surfaced in Admin ? Dev Tools.
