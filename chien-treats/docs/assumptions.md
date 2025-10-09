# Assumptions

- PFP_Colors token values match those defined in the brief (styles/tokens.css).
- Orders are demo-only until a backend is connected; Stripe stays a placeholder.
- Pickup occurs at the Capitol Hill studio with same-day notice. Delivery is a flat $5 fee within Seattle city limits.
- Sales tax is simulated at 8% for demos.
- Coupon catalogue ships with WELCOME10; additional coupons are manageable via the admin UI.
- About and FAQ copy can be edited in the content admin but ship with tasteful defaults.
- Newsletter signups are stored client-side; export will occur via the admin or dev tools.
- Analytics events are captured through a stubbed useAnalytics hook (to be implemented when GA4 is defined).
