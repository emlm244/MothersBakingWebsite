# Assumptions

## Architecture & Deployment

- **Full-stack deployment**: Next.js 15 frontend + NestJS API + PostgreSQL database
- **Data persistence**: PostgreSQL with Prisma ORM (production mode)
- **Dual-mode support**: Can operate in client-only mode (IndexedDB) for development/demo
- **Current deployment**: VPS at 109.205.180.240 with systemd services, nginx reverse proxy

## Design & Styling

- PFP_Colors token values match those defined in the brief (styles/tokens.css)
- Design system uses Tailwind CSS with CSS variable tokens
- Radix UI primitives for accessible components

## Business Logic

- **Order fulfillment**: Pickup at Capitol Hill studio with same-day notice. Delivery is a flat $5 fee within Seattle city limits
- **Sales tax**: 8% (configurable per jurisdiction in production)
- **Payment processing**: Stripe integration ready (awaiting production keys)
- **Coupon system**: Initial catalogue includes WELCOME10; additional coupons manageable via admin UI

## Content Management

- About and FAQ copy editable via admin UI (ships with default content)
- Product catalog managed through admin dashboard
- Review moderation system (admin approval required)

## Data & Analytics

- Newsletter signups stored in PostgreSQL database
- Export/import functionality available via admin dev tools
- Analytics events captured through stubbed useAnalytics hook (ready for GA4 integration)
