import Link from "next/link";
import { company, caseStudies, services, testimonials } from "@/content/site";
import { createMetadata } from "@/lib/metadata";
import { ArrowRight, ShieldCheck, Sparkles, Timer } from "lucide-react";

export const metadata = createMetadata({
  title: "Managed hosting, operations, and performance for marketing-led teams",
  description:
    "Coral Hosts keeps your marketing sites, headless CMS, and web apps fast, secure, and compliant. We handle infrastructure, incident response, and Core Web Vitals so you can ship campaigns on time.",
  path: "/",
});

const heroHighlights = [
  {
    title: "Edge-first delivery",
    description: "48 global POPs, smart caching, and API routing ensure sub-200ms experiences on every device.",
    icon: Sparkles,
  },
  {
    title: "Operations on autopilot",
    description: "Blue/green deploys, runbooks, and an on-call pod backing your team with 15-minute SLA.",
    icon: Timer,
  },
  {
    title: "Security built-in",
    description: "WAF, secrets rotation, compliance reporting, and hardened stacks aligned to ISO 27001.",
    icon: ShieldCheck,
  },
];

export default function HomePage() {
  const featuredStudies = caseStudies.slice(0, 2);
  const featuredServices = services.slice(0, 3);

  return (
    <div className="space-y-20 pb-20">
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-surface to-secondary-50">
        <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_top,_rgba(17,127,146,0.18),transparent_55%)] md:block" aria-hidden />
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:px-6 lg:py-24">
          <div className="space-y-6">
            <span className="inline-flex items-center rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-primary-600">
              Managed Web Reliability
            </span>
            <h1 className="font-display text-4xl leading-tight text-navy-900 sm:text-5xl">
              Infrastructure and on-call specialists for high-stakes marketing websites.
            </h1>
            <p className="max-w-xl text-base text-slate-600 sm:text-lg">{company.description}</p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center rounded-md bg-primary-500 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2"
              >
                Book a discovery call
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 rounded-md border border-secondary-400 px-5 py-3 text-sm font-semibold text-secondary-600 transition hover:bg-secondary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-400 focus-visible:ring-offset-2"
              >
                Explore services <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <dl className="grid gap-4 sm:grid-cols-2">
              {company.metrics.map((metric) => (
                <div key={metric.label} className="rounded-lg bg-white/70 p-4 shadow-xs backdrop-blur">
                  <dt className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">{metric.label}</dt>
                  <dd className="mt-2 font-display text-2xl text-primary-600">{metric.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="flex flex-col gap-4 rounded-2xl bg-white/90 p-6 shadow-hero backdrop-blur">
            {heroHighlights.map((item) => (
              <article key={item.title} className="rounded-xl border border-slate-100/80 bg-surface p-5 shadow-xs">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondary-50 text-secondary-600">
                    <item.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h2 className="font-display text-lg text-navy-900">{item.title}</h2>
                </div>
                <p className="mt-2 text-sm text-slate-600">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 md:px-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">What we run</p>
            <h2 className="mt-1 font-display text-3xl text-navy-900">Managed services tuned to your stack</h2>
          </div>
          <Link href="/services" className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:underline">
            View all services <ArrowRight className="h-4 w-4" />
          </Link>
        </header>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {featuredServices.map((service) => (
            <article key={service.slug} className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-soft">
              <h3 id={service.slug} className="font-display text-xl text-navy-900">
                {service.title}
              </h3>
              <p className="mt-3 text-sm text-slate-600">{service.summary}</p>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                {service.outcomes.slice(0, 3).map((outcome) => (
                  <li key={outcome} className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary-500" aria-hidden />
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-5">
                <Link
                  href={`/services#${service.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:underline"
                >
                  How it works <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
          <header className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Proof in numbers</p>
            <h2 className="font-display text-3xl text-navy-900">Case studies from the field</h2>
            <p className="max-w-3xl text-sm text-slate-600">
              We partner with marketing operations, product, and compliance teams to orchestrate launches without surprises. Each engagement ships with runbooks, observability, and the people who care for it.
            </p>
          </header>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {featuredStudies.map((study) => (
              <article key={study.slug} className="flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-soft">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-secondary-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-secondary-600">
                    {study.industry}
                  </span>
                  <span className="text-xs text-slate-500">{study.year}</span>
                </div>
                <h3 className="mt-4 font-display text-2xl text-navy-900">{study.title}</h3>
                <p className="mt-3 text-sm text-slate-600">{study.summary}</p>
                <ul className="mt-5 grid gap-3 text-sm text-slate-600">
                  {study.outcomeMetrics.map((metric) => (
                    <li key={metric.label} className="rounded-lg bg-surface-muted/60 p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">{metric.label}</p>
                      <p className="mt-1 font-display text-xl text-primary-600">{metric.value}</p>
                      <p className="text-xs text-slate-500">{metric.detail}</p>
                    </li>
                  ))}
                </ul>
                <blockquote className="mt-5 rounded-lg border-l-4 border-primary-300 bg-primary-50/60 p-4 text-sm text-primary-700 shadow-xs">
                  “{study.quote.body}”
                  <footer className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary-600">
                    — {study.quote.author}, {study.quote.role}
                  </footer>
                </blockquote>
                <div className="mt-auto pt-6">
                  <Link href={`/projects/${study.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:underline">
                    Read the full engagement <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 md:px-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Trusted by teams shipping fast</p>
            <h2 className="mt-1 font-display text-3xl text-navy-900">Testimonials</h2>
          </div>
          <Link href="/about" className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:underline">
            Meet the team <ArrowRight className="h-4 w-4" />
          </Link>
        </header>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {testimonials.map((item) => (
            <figure key={item.name} className="relative h-full rounded-2xl bg-white p-6 shadow-soft">
              <p className="text-sm text-slate-600">“{item.quote}”</p>
              <figcaption className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary-600">
                {item.name}
                <span className="block text-[10px] text-slate-500 normal-case tracking-normal">{item.title}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-br from-secondary-50 via-surface to-primary-50">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 rounded-3xl px-4 py-14 text-center shadow-hero md:px-6">
          <span className="inline-flex items-center justify-center rounded-full border border-secondary-300 bg-secondary-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-secondary-600">
            Let&apos;s get started
          </span>
          <h2 className="font-display text-3xl text-navy-900 sm:text-4xl">Ready for a calmer launch calendar?</h2>
          <p className="mx-auto max-w-2xl text-sm text-slate-600 sm:text-base">
            We onboard most marketing sites in under three weeks. Every engagement begins with a discovery session, infrastructure audit, and an incident response plan your stakeholders can sign off on.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center rounded-md bg-primary-500 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2"
            >
              Request a proposal
            </Link>
            <a
              href="https://cal.com/coral-hosts/intro"
              rel="noopener noreferrer"
              target="_blank"
              className="inline-flex items-center gap-2 rounded-md border border-secondary-400 px-5 py-3 text-sm font-semibold text-secondary-600 transition hover:bg-secondary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-400 focus-visible:ring-offset-2"
            >
              Schedule a 30-minute intro <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
