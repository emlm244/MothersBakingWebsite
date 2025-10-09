# Contributing to Chien's Treats

Thank you for your interest in contributing to Chien's Treats! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style & Standards](#code-style--standards)
- [Testing Requirements](#testing-requirements)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Project Architecture](#project-architecture)

## Code of Conduct

This project follows a professional code of conduct. Be respectful, constructive, and collaborative. Discrimination, harassment, or unprofessional behavior will not be tolerated.

## Getting Started

### Prerequisites

- Node.js 20+ and pnpm 10+
- Git
- Code editor (VS Code recommended)

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/your-org/chien-treats.git
cd chien-treats

# Install dependencies
pnpm install

# Run development server
pnpm dev

# Open http://localhost:3000
```

### Project Structure

```
chien-treats/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── (site)/       # Customer-facing routes
│   │   └── (admin)/      # Admin console routes
│   ├── components/       # Shared React components
│   ├── features/         # Feature modules (cart, auth, ticketing)
│   ├── lib/              # Utility functions
│   ├── store/            # Redux Toolkit slices
│   └── styles/           # Global styles and design tokens
├── packages/
│   ├── data/             # Data layer abstractions
│   ├── ui/               # Design system components
│   ├── config/           # Shared configuration
│   └── emails/           # Email templates
├── apps/
│   └── api/              # NestJS backend (optional)
└── public/               # Static assets
```

## Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `fix/*` - Bug fixes
- `chore/*` - Maintenance tasks

### Making Changes

1. **Create a branch** from `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our code standards

3. **Test your changes**:
   ```bash
   pnpm lint          # Check code style
   pnpm typecheck     # Check TypeScript types
   pnpm test          # Run unit tests
   pnpm test:e2e      # Run E2E tests (if applicable)
   ```

4. **Commit your changes** following our commit message guidelines

5. **Push and create a pull request**:
   ```bash
   git push origin feature/your-feature-name
   ```

## Code Style & Standards

### TypeScript

- **Always use TypeScript** - No JavaScript files except configuration
- **Strict mode enabled** - No `any` types without justification
- **Explicit return types** for exported functions
- **Interfaces over types** for object shapes
- **Enums for constants** when appropriate

### React & Next.js

- **Functional components with hooks** - No class components
- **Server Components by default** - Add `"use client"` only when needed
- **Prop validation** - Use TypeScript interfaces, not PropTypes
- **Meaningful component names** - `UserProfileCard` not `Component1`
- **One component per file** - Except for small, related helpers

### Code Organization

```typescript
// ✅ Good: Clear imports, types, component structure
import { useState, useEffect } from "react";
import { Button, Card } from "@ui";
import type { Product } from "@data";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  // Component logic
}

// ❌ Bad: Mixed concerns, unclear types
export default function Card(props: any) {
  // ...
}
```

### Styling

- **Tailwind CSS first** - Use utility classes
- **Design tokens** - Reference `styles/tokens.css` for colors
- **Responsive by default** - Mobile-first approach
- **Accessibility required** - Semantic HTML, ARIA labels

```tsx
// ✅ Good: Tailwind utilities, accessible, responsive
<button
  className="rounded-full bg-pink px-6 py-3 text-white hover:bg-pink-600 focus-visible:ring-2 focus-visible:ring-pink md:px-8 md:py-4"
  aria-label="Add to cart"
>
  Add to cart
</button>

// ❌ Bad: Inline styles, no accessibility
<button style={{background: '#F7A8C5'}}>
  Add
</button>
```

## Testing Requirements

### Test Coverage Goals

- **80%+ statement coverage** for new code
- **100% coverage** for business logic (cart, checkout, coupons)
- **E2E tests** for critical user flows

### Writing Tests

```typescript
// Example: Unit test for cart logic
import { describe, it, expect } from "vitest";
import { cartSlice } from "./cartSlice";

describe("cartSlice", () => {
  it("should add item to cart", () => {
    const state = cartSlice.reducer(undefined, {
      type: "cart/addItem",
      payload: { productId: "1", quantity: 2 },
    });
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(2);
  });
});
```

### Running Tests

```bash
# Unit tests
pnpm test                    # Run once
pnpm test:watch              # Watch mode

# E2E tests
pnpm test:e2e                # Headless
pnpm test:e2e:ui             # UI mode

# Coverage
pnpm test -- --coverage
```

## Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring (no feature change)
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks (dependencies, build config)

### Examples

```bash
# Feature
feat(cart): add quantity selector to cart items

# Bug fix
fix(checkout): prevent duplicate order submission

# Documentation
docs(readme): update installation instructions

# Refactor
refactor(products): extract product card to separate component

# Test
test(cart): add tests for coupon validation
```

### Scope

Use these scopes for clarity:
- `cart`, `checkout`, `orders` - Shopping features
- `products`, `reviews` - Product catalog
- `auth`, `session` - Authentication
- `admin` - Admin console
- `ui`, `components` - UI components
- `api` - Backend API
- `deps` - Dependencies
- `ci` - CI/CD

## Pull Request Process

### Before Submitting

1. **Sync with latest develop**:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout your-branch
   git rebase develop
   ```

2. **Run all checks**:
   ```bash
   pnpm lint
   pnpm typecheck
   pnpm test
   pnpm build
   ```

3. **Self-review your changes**:
   - Remove debug logs
   - Check for commented-out code
   - Verify all TODOs are addressed or documented

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass locally
```

### Review Process

1. **Automated checks** must pass (lint, typecheck, tests, build)
2. **At least one approval** required from code owners
3. **No unresolved conversations** before merging
4. **Squash and merge** to keep history clean

## Project Architecture

### Data Provider Pattern

The app uses a swappable data provider pattern:

```typescript
// packages/data/provider.ts
export interface DataProvider {
  getProducts(): Promise<Product[]>;
  createOrder(order: Order): Promise<Order>;
  // ...
}

// Implementations:
// - indexed-db-provider.ts (client-only mode)
// - rest-provider.ts (full-stack mode)
// - memory-provider.ts (testing/fallback)
```

When adding features, always implement through the `DataProvider` interface, not directly against IndexedDB or REST.

### State Management

- **Redux Toolkit** for global state (cart, auth, session)
- **React Hook Form + Zod** for form state and validation
- **Server state** via data provider (no caching layer currently)

### Routing Conventions

- `app/(site)/` - Customer-facing, public pages
- `app/(admin)/` - Admin console, role-gated
- `app/api/` - API routes (if not using separate backend)

### Adding a New Page

1. Create route in appropriate directory:
   ```tsx
   // src/app/(site)/new-page/page.tsx
   export default function NewPage() {
     return <div>Content</div>;
   }
   ```

2. Add to sitemap:
   ```typescript
   // src/app/sitemap.ts
   const ROUTES = [
     // ...
     "/new-page",
   ];
   ```

3. Update navigation if needed:
   ```tsx
   // src/components/MobileNav.tsx or site layout
   ```

### Design System

Use components from `packages/ui`:

```typescript
import { Button, Card, Input, Label } from "@ui";
```

For custom styles, reference design tokens:

```css
/* styles/tokens.css */
:root {
  --color-pink: #F7A8C5;
  --color-cream: #FFF7F3;
  --color-brown: #6B4A3A;
  /* ... */
}
```

Tailwind is configured to use these tokens:

```jsx
<div className="bg-cream text-brown border-pink">
  Uses design tokens automatically
</div>
```

## Questions or Issues?

- **Bug reports**: [GitHub Issues](https://github.com/your-org/chien-treats/issues)
- **Feature requests**: [GitHub Discussions](https://github.com/your-org/chien-treats/discussions)
- **Questions**: Ask in discussions or reach out to maintainers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Chien's Treats! 🍰
