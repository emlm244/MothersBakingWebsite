import { services } from "@/content/site";
import { createMetadata } from "@/lib/metadata";
import Link from "next/link";

export const metadata = createMetadata({
  title: "Services tailored to marketing, product, and compliance teams",
  description:
    "Coral Hosts provides managed WordPress, application hosting, and performance programs with SLAs, on-call experts, and compliance-ready operations.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-16 px-4 py-16 md:px-6">
      <header className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Services</p>
        <h1 className="font-display text-4xl text-navy-900">Operational maturity for every layer of your web presence</h1>
        <p className="max-w-3xl text-base text-slate-600">
          We design managed programs around your CMS, application stack, and success metrics. Every engagement includes SLAs, observability, and the people who run it.
        </p>
      </header>

      <section className="space-y-12">
        {services.map((service) => (
          <article key={service.slug} id={service.slug} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
            <div className="flex flex-col gap-6 md:flex-row md:justify-between">
              <div className="max-w-2xl space-y-4">
                <span className="inline-flex w-fit items-center rounded-full border border-secondary-300 bg-secondary-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-secondary-600">
                  {service.featuredTools.join(" ∙ ")}
                </span>
                <h2 className="font-display text-3xl text-navy-900">{service.title}</h2>
                <p className="text-base text-slate-600">{service.summary}</p>
              </div>
              <div className="rounded-xl bg-surface-muted/80 p-4 text-sm text-slate-600 shadow-xs md:w-72">
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">What you receive</h3>
                <ul className="mt-3 space-y-2">
                  {service.deliverables.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary-500" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <section className="space-y-3 rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Outcomes we target</h3>
                <ul className="space-y-3 text-sm text-slate-600">
                  {service.outcomes.map((outcome) => (
                    <li key={outcome} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-secondary-500" aria-hidden />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </section>
              <section className="space-y-3 rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Engagement touchpoints</h3>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary-500" aria-hidden />
                    <span>Onboarding workshop to map goals, SLAs, and escalation paths.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary-500" aria-hidden />
                    <span>Implementation sprint with paired engineers to deploy infrastructure as code.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary-500" aria-hidden />
                    <span>Monthly business reviews covering KPIs, incidents, and upcoming launches.</span>
                  </li>
                </ul>
              </section>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-3xl bg-gradient-to-br from-primary-50 via-surface to-secondary-50 p-8 shadow-hero">
        <h2 className="font-display text-2xl text-navy-900">Not sure where to start?</h2>
        <p className="mt-3 max-w-2xl text-sm text-slate-600">
          We offer a two-week diagnostic for new partners. Together we baseline uptime, performance, access controls, and release processes. You leave with a prioritized roadmap whether or not you continue with Coral Hosts.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/contact"
            className="inline-flex items-center rounded-md bg-primary-500 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2"
          >
            Request the diagnostic
          </Link>
          <a
            href="https://cal.com/coral-hosts/intro"
            rel="noopener noreferrer"
            target="_blank"
            className="inline-flex items-center gap-2 rounded-md border border-secondary-400 px-5 py-3 text-sm font-semibold text-secondary-600 transition hover:bg-secondary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-400 focus-visible:ring-offset-2"
          >
            Meet the team first
          </a>
        </div>
      </section>
    </div>
  );
}
