# ADR 001: Client-Only Production Mode

**Status:** Accepted
**Date:** 2025-10-08
**Decision Makers:** Lead Engineer
**Context:** Production readiness assessment for Chien's Treats bakery website

## Context and Problem Statement

The codebase contains both a fully functional client-side application (Next.js + IndexedDB) and a comprehensive but untested backend API (NestJS + PostgreSQL + Redis).

**Current state:**
- Frontend: 27 pages, working commerce flow, offline-capable via IndexedDB
- Backend: 27/27 API endpoints implemented, ZERO test coverage
- Integration: REST provider stub exists but FE/BE not connected
- Timeline: Need production-ready solution

**The decision:** Which architecture should we deploy to production?

## Decision Drivers

* **Test Coverage:** Frontend has minimal but functional testing infrastructure; Backend has 0% coverage (requires 56-92 hours per security audit to reach 85%)
* **Functional Completeness:** Client-only mode is fully functional; Full-stack mode requires REST provider completion + response normalization
* **Security:** Client-only has no server attack surface; Backend has critical middleware but no test validation
* **Deployment Complexity:** Client-only: single static deployment; Full-stack: requires PostgreSQL, Redis, worker queues, email service
* **Business Value:** A working bakery website TODAY vs. a more scalable system in 6-8 weeks
* **Engineering Principle:** "Ship the clean, small, tested solution" (per engineering guidelines)

## Considered Options

### Option A: Full-Stack Mode (NestJS API + PostgreSQL)
**Pros:**
- True multi-user support with RBAC
- Email notifications for tickets
- Stripe webhook integration
- Centralized data persistence
- Better audit trails

**Cons:**
- ZERO backend test coverage (CRITICAL blocker)
- Requires infrastructure: PostgreSQL, Redis, worker process, SMTP
- REST provider incomplete
- Response wrapper inconsistencies
- 56-92 hours additional work before production-ready
- Higher operational complexity

**Estimated timeline:** 6-8 weeks additional work

### Option B: Client-Only Mode with IndexedDB (Current)
**Pros:**
- Fully functional NOW
- No backend attack surface
- Works offline (progressive web app potential)
- Simple deployment (static export or serverless)
- Lower infrastructure costs
- Existing code is proven and working

**Cons:**
- Data siloed per browser/device
- No real email notifications
- Limited multi-user workflows
- Stripe integration remains demo mode
- Admin panel requires discipline (no RBAC enforcement)

**Estimated timeline:** Production-ready in 1-2 weeks (polish + tests)

### Option C: Hybrid Approach
Deploy client-only now, migrate to full-stack later.

**Pros:**
- Fastest time to market
- De-risks backend development
- Allows backend testing without production pressure
- Frontend remains compatible (same DataProvider interface)

**Cons:**
- Requires data migration plan
- Some features will change behavior

## Decision Outcome

**Chosen option: Option C (Hybrid) - Client-Only Now, Full-Stack Later**

### Rationale

1. **Business Impact:** A working bakery website with online ordering capability delivers immediate value. Waiting 6-8 weeks delays revenue and customer feedback.

2. **Risk Management:** Deploying untested backend code (0% coverage) to production violates security best practices and introduces unnecessary risk.

3. **Technical Pragmatism:** The DataProvider abstraction was specifically designed for this scenario. Swapping implementations later requires minimal frontend changes.

4. **Resource Optimization:** Focus engineering time on polish, testing, and user experience rather than backend test scaffolding for features that may change based on real customer feedback.

### Implementation Plan

**Immediate (Week 1):**
- ✅ Fix critical security vulnerabilities (Next.js 15.2.3+, @fastify/multipart 8.3.1+)
- ✅ Remove "demo" language from production copy
- ✅ Robots.txt and sitemap already implemented
- Add LocalBusiness JSON-LD schema
- Add OpenGraph metadata to all pages
- Make contact form publicly accessible (remove auth gate)
- Add favicon and brand assets
- Test core user flows (browse → cart → checkout)
- Update documentation to reflect client-only mode
- Document migration path to full-stack

**Near-term (Weeks 2-4):**
- Expand test coverage (target 80% for core flows)
- Performance audit and optimization
- Comprehensive a11y review
- Mobile navigation improvements
- Add Honeypot spam protection to all forms
- Analytics integration (privacy-respecting)

**Future (Post-Launch):**
- Complete backend test suite (reach 85% coverage)
- Implement REST provider
- Add email verification flow
- Deploy backend infrastructure
- Gradual migration with feature flags

### Migration Strategy

When transitioning to full-stack:

1. Deploy backend with feature flag system
2. Run both modes in parallel (A/B test)
3. Add data sync mechanism (IndexedDB → API)
4. Monitor error rates and performance
5. Gradual rollout by user segment
6. Deprecate client-only mode after 90% adoption

### Acceptance Criteria for Backend Deployment

Before enabling full-stack mode:
- [ ] ≥85% test coverage on all API modules
- [ ] All 4 required E2E-API scenarios passing
- [ ] Response wrapper standardization complete
- [ ] REST provider implemented with error handling
- [ ] Email service configured with fallback
- [ ] Database backup/restore procedures documented
- [ ] Monitoring and alerting configured
- [ ] Load testing completed (1000 concurrent users)
- [ ] Security audit by third party completed

## Consequences

### Positive

* Website can launch immediately with core functionality
* Lower operational complexity and costs
* No database/backend maintenance burden initially
* Frontend developers can iterate rapidly
* Real user feedback informs backend priorities

### Negative

* No centralized analytics on user behavior
* Admin panel data changes not persisted across team members
* Stripe remains in demo mode (external payment link alternative needed)
* Email notifications manual (until backend ready)

### Mitigation

* Document clear instructions for admins on data export/import
* Use external tools (Typeform/Google Forms) for critical workflows requiring email
* Provide Stripe Payment Links as checkout alternative
* Set clear expectations in UI about offline/local nature
* Monitor user feedback for pain points

## References

* HANDOFF.md - Documents backend gaps and 56-92 hour estimate
* Findings.md - Security audit showing zero backend test coverage
* packages/data/provider.ts - DataProvider abstraction enabling swap
* Engineering Guidelines - "Ship the clean, small, tested solution"

## Notes

This decision is REVERSIBLE. The frontend architecture explicitly supports both modes via the DataProvider interface. We are optimizing for speed to market while maintaining technical flexibility.

**Status check (6 weeks post-launch):** Review analytics, user feedback, and business metrics to determine if full-stack migration is justified. The backend code remains valuable even if never deployed—it documents data contracts and business logic.
