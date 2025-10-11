export const company = {
  name: "Coral Hosts",
  domain: "coralhosts.com",
  tagline: "Reliable managed hosting for people who would rather focus on their business.",
  description:
    "Coral Hosts keeps modern marketing sites, web apps, and CMS platforms fast, secure, and resilient. Our managed platform pairs tuned infrastructure with human operations so teams can launch confidently and sleep through the night.",
  headquarters: {
    city: "San Diego",
    region: "CA",
    country: "USA",
    timeZone: "America/Los_Angeles",
  },
  responseSla: "15-minute human response, 24/7",
  sameAs: [
    "https://www.linkedin.com/company/coral-hosts",
    "https://github.com/coral-hosts",
    "https://dribbble.com/coralhosts",
    "https://twitter.com/coralhosts",
  ],
  contacts: {
    sales: {
      email: "hello@coralhosts.com",
      phone: "+1-619-555-0160",
    },
    support: {
      email: "support@coralhosts.com",
      phone: "+1-619-555-0161",
    },
  },
  metrics: [
    { value: "99.99%", label: "Uptime across managed fleet (rolling 12 months)" },
    { value: "<200ms", label: "Median origin response after full-page cache" },
    { value: "180+", label: "Deploys automated each month" },
    { value: "48", label: "Global POPs with edge observability" },
  ],
  certifications: [
    "ISO/IEC 27001-aligned controls",
    "SOC 2 Type II audited partner network",
    "Cloudflare Enterprise channel partner",
    "Let's Encrypt sponsor member",
  ],
} as const;

export const leadership = [
  {
    name: "Aria Chen",
    role: "Founder & Director of Reliability",
    bio: "Previously led platform engineering at coastal SaaS scale-ups. Obsessed with boring infrastructure and happy teams.",
  },
  {
    name: "Miguel Alvarez",
    role: "Head of Delivery",
    bio: "15 years guiding agencies and product teams through multi-region launches, compliance reviews, and replatforms.",
  },
  {
    name: "Sloane Patel",
    role: "Director of Performance Programs",
    bio: "Core Web Vitals whisperer who blends analytics, design systems, and accessibility into measurable wins.",
  },
] as const;

export const navigation = {
  primary: [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/projects", label: "Case Studies" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ],
  secondary: [
    { href: "/media-kit", label: "Media Kit" },
    { href: "/legal/privacy", label: "Privacy" },
    { href: "/legal/terms", label: "Terms" },
  ],
} as const;

export const services = [
  {
    slug: "managed-wordpress",
    title: "Managed WordPress & CMS Hosting",
    summary: "Enterprise-grade performance, security patches, and content workflows without the maintenance burden.",
    outcomes: [
      "Global cache rules tailored to marketing teams",
      "Immutable infrastructure with instant rollbacks",
      "Zero-downtime core and plugin updates with staging previews",
    ],
    deliverables: [
      "Isolated production, staging, and ephemeral preview environments",
      "GitOps pipeline with blue/green deploys",
      "Nightly database and asset snapshots retained for 35 days",
      "Web application firewall, bot mitigation, and managed DDoS",
    ],
    featuredTools: ["Cloudflare Enterprise", "WP-CLI automations", "GitHub Actions", "Kubernetes"],
  },
  {
    slug: "application-hosting",
    title: "Application & API Hosting",
    summary: "Kubernetes-backed runtime and observability tuned for modern TypeScript, Rails, and Laravel teams.",
    outcomes: [
      "Predictable latency with autoscaling workloads",
      "Service-level error budgets and alert routing",
      "Private networking with managed database clusters",
    ],
    deliverables: [
      "Infrastructure as Code (Terraform) checked into your repo",
      "24/7 on-call with runbooks and escalation workflows",
      "Runtime hardening, secrets rotation, and dependency checks",
      "Synthetic and real-user monitoring with weekly reports",
    ],
    featuredTools: ["Fly.io", "Render", "AWS ECS", "Grafana Cloud", "PagerDuty"],
  },
  {
    slug: "performance-audits",
    title: "Performance & Accessibility Programs",
    summary: "Hands-on audits and remediation sprints to keep Core Web Vitals, WCAG AA, and SEO in the green.",
    outcomes: [
      "Measured improvements to LCP, INP, and CLS across devices",
      "Automated accessibility regression tests in CI",
      "Structured data, sitemap, and metadata governance",
    ],
    deliverables: [
      "Discovery workshop & prioritized remediation backlog",
      "Implementation pairing with your product team",
      "KPI dashboard and executive-friendly reporting",
      "Training for developers, writers, and designers",
    ],
    featuredTools: ["Lighthouse CI", "axe-core", "SpeedCurve", "Semrush"],
  },
] as const;

export const caseStudies = [
  {
    slug: "atlas-group",
    title: "Atlas Group — Launching a multi-region B2B marketing site in 21 days",
    industry: "B2B SaaS",
    client: "Atlas Group",
    year: 2025,
    summary:
      "Migrated Atlas Group's marketing platform from a brittle on-prem stack to Coral Hosts' managed WordPress cluster with automated staging, launch toggles, and real-time analytics.",
    problem:
      "Atlas Group's site suffered 5+ hours of downtime during every campaign push due to manual deploys and lack of caching. Their content team needed staging links, approvals, and predictable metrics before an investor roadshow.",
    approach: [
      "Provisioned isolated Kubernetes workloads across three regions with Cloudflare edge caching tuned for personalized content.",
      "Implemented GitHub Actions pipeline with blue/green deploys, visual regression tests, and Slack approvals.",
      "Delivered performance remediation sprint shaving 1.4s off LCP on primary landing pages.",
    ],
    outcomeMetrics: [
      { label: "Time to publish", value: "↓ 73%", detail: "from 55 minutes to 15 minutes with staging approvals" },
      { label: "Core Web Vitals", value: "↑ 22%", detail: "passing visits rose from 61% to 83% in four weeks" },
      { label: "Downtime", value: "0 incidents", detail: "during launch week despite 3x expected traffic" },
    ],
    quote: {
      body: "Coral Hosts took us from white-knuckle releases to confidence-inspiring automation. Our marketing ops dashboard finally tells us the truth in real-time.",
      author: "Mei Tan",
      role: "VP Growth, Atlas Group",
    },
    services: ["Managed WordPress & CMS Hosting", "Performance & Accessibility Programs"],
  },
  {
    slug: "tidal-ventures",
    title: "Tidal Ventures — Compliance-focused hosting for investor portals",
    industry: "Finance",
    client: "Tidal Ventures",
    year: 2024,
    summary:
      "Delivered audited infrastructure for a venture capital firm handling LP updates and quarterly reports, including SSO, role-based access, and geo-fenced content.",
    problem:
      "Tidal's investor relations portal lived on a shared VPS with no audit trail or access policies. Regulatory review flagged weak change control and the team needed a fix before their next fundraise.",
    approach: [
      "Defined Terraform-managed infrastructure with encrypted S3 asset storage, Cloudflare Access policies, and Okta SSO.",
      "Set up automated content approval flows with change history and attestation records.",
      "Implemented log aggregation with immutable retention and quarterly compliance reporting.",
    ],
    outcomeMetrics: [
      { label: "Audit findings", value: "Resolved 11/11", detail: "items cleared in the following SOC 2 review" },
      { label: "Access breaches", value: "0 incidents", detail: "after enforcing SSO and IP allowlists" },
      { label: "Team satisfaction", value: "9.6 / 10", detail: "average stakeholder score post-migration" },
    ],
    quote: {
      body: "We expected a hosting vendor. Instead we gained a partner who writes our runbooks, joins board meetings, and treats compliance as table stakes.",
      author: "Andre Martinez",
      role: "COO, Tidal Ventures",
    },
    services: ["Application & API Hosting", "Performance & Accessibility Programs"],
  },
] as const;

export const testimonials = [
  {
    quote:
      "We ship campaigns without waking the engineering team. Coral Hosts gives us staging previews, launch toggles, and 15-minute support responses when we need them.",
    name: "Sasha Patel",
    title: "Director of Digital, Canvas Studio",
  },
  {
    quote:
      "Their performance sprints took our LCP down to 1.4 seconds globally. More importantly, they documented everything so we can keep the gains.",
    name: "Jordan Rivera",
    title: "Head of Product, Luma Analytics",
  },
  {
    quote:
      "Security questionnaires used to take weeks. Now we hand prospects a Coral Hosts runbook and it closes the loop in a single call.",
    name: "Priya Desai",
    title: "Revenue Operations, Switchboard Labs",
  },
] as const;

export const faqs = [
  {
    question: "Do you offer 24/7 on-call support?",
    answer:
      "Yes. Every managed plan includes a shared Slack channel, on-call engineers with a 15-minute response SLA, and escalation to video bridges for incident coordination.",
  },
  {
    question: "Can you work with our existing development agency?",
    answer:
      "Absolutely. We partner with in-house teams and agencies. We provide infrastructure, monitoring, and runbooks while your developers retain creative control.",
  },
  {
    question: "Where is Coral Hosts infrastructure located?",
    answer:
      "We deploy across multiple North American and European regions using Fly.io and AWS, with a 48-POP Cloudflare Enterprise edge. Customer data residency can be tailored per project.",
  },
  {
    question: "How does pricing work?",
    answer:
      "Plans start at $1,850/month for managed hosting with quarterly performance reviews. Application hosting and compliance add-ons are scoped during a discovery workshop. All engagements include onboarding, runbooks, and monthly reporting.",
  },
] as const;

export const mediaAssets = [
  {
    title: "Primary Coral Hosts logomark",
    description: "Full-color SVG on transparent background.",
    href: "/brand/coral-hosts-logomark.svg",
  },
  {
    title: "Logomark (outline)",
    description: "SVG outline for dark backgrounds.",
    href: "/brand/coral-hosts-logomark-outline.svg",
  },
] as const;
