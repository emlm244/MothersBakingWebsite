# Coral Hosts

Coral Hosts is a managed hosting and web reliability partner for marketing, product, and compliance teams. The site is a statically generated Next.js 15 application with structured content, accessibility-first UI, and lead generation flows wired into a spam-hardened contact intake.

## Getting started

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000 to view the marketing site. The project uses the Next.js App Router; edits hot reload instantly.

## Scripts

| command          | description                                      |
| ---------------- | ------------------------------------------------ |
| `pnpm dev`       | Start the development server                     |
| `pnpm build`     | Production build with static generation          |
| `pnpm start`     | Serve the production build                       |
| `pnpm lint`      | ESLint with JSX a11y and Tailwind rules          |
| `pnpm typecheck` | TypeScript project check                         |
| `pnpm test`      | Vitest unit tests                                |
| `pnpm test:e2e`  | Playwright smoke and accessibility regression    |
| `pnpm check`     | Run lint, typecheck, unit, and e2e suites        |

## Architecture

- **Framework**: Next.js 15 (App Router) with React 19 RC
- **Styling**: Tailwind CSS with design tokens declared in `styles/tokens.css`
- **Content**: Typed data modules in `src/content` feeding page layouts
- **Forms**: React Hook Form + Zod validation, anti-spam honeypot + time-trap, optional SMTP delivery
- **SEO**: JSON-LD schema (Organization, Service, Project, Breadcrumb), sitemap, and tuned metadata helpers
- **Testing**: Vitest for units, Testing Library helpers, Playwright e2e with axe assertions ready for expansion

## Contact form delivery

`/api/contact` expects SMTP credentials via environment variables:

```
SMTP_HOST=
SMTP_PORT=
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
CONTACT_INBOX=hello@coralhosts.com
CONTACT_FROM=no-reply@coralhosts.com
```

If SMTP credentials are absent the submission is logged to the server console, ensuring local development works without external services.

## Accessibility & performance guardrails

- Accessible navigation, skip links, focus management, and high-contrast theming
- Automated timing checks on contact form submissions to discourage spam bots
- Responsive hero and section layouts optimized for Core Web Vitals (no blocking scripts, minimal bundle)
- `pnpm test:e2e` confirms critical journeys and catches regressions early

## Deployment

1. `pnpm build` generates a static bundle suitable for any Node or edge host.
2. Serve with `pnpm start` (Next.js standalone output) behind your reverse proxy/CDN.
3. Provide the SMTP env vars above for contact intake notifications.
4. Update `NEXT_PUBLIC_SITE_URL` to the canonical host before deployment so metadata + sitemap emit correct URLs.

For VPS or container-based deploys see `RUNBOOK.md` for operational guidance, health checks, and rollback steps.

## License

MIT – see [LICENSE](./LICENSE).
