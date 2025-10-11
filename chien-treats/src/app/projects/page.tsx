import Link from "next/link";
import { caseStudies } from "@/content/site";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Case studies across SaaS, finance, and scale-up teams",
  description:
    "Read how Coral Hosts partners with growth, marketing, and compliance teams to deliver resilient launches, faster sites, and stress-free operations.",
  path: "/projects",
});

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-14 px-4 py-16 md:px-6">
      <header className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Case studies</p>
        <h1 className="font-display text-4xl text-navy-900">Launch outcomes we stand behind</h1>
        <p className="max-w-3xl text-base text-slate-600">
          Each project includes managed infrastructure, runbooks, and measurement. We share highlights below; reach out for references or deeper dives.
        </p>
      </header>
      <div className="space-y-10">
        {caseStudies.map((study) => (
          <article key={study.slug} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
              <span className="rounded-full bg-secondary-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-secondary-600">
                {study.industry}
              </span>
              <span className="text-xs text-slate-500">{study.year}</span>
            </div>
            <h2 className="mt-4 font-display text-3xl text-navy-900">{study.title}</h2>
            <p className="mt-3 text-sm text-slate-600">{study.summary}</p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {study.outcomeMetrics.map((metric) => (
                <div key={metric.label} className="rounded-xl bg-surface-muted/80 p-4 text-sm shadow-xs">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{metric.label}</p>
                  <p className="mt-1 font-display text-2xl text-primary-600">{metric.value}</p>
                  <p className="text-xs text-slate-500">{metric.detail}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-secondary-600">
              {study.services.map((svc) => (
                <span key={svc} className="rounded-full bg-secondary-50 px-3 py-1">
                  {svc}
                </span>
              ))}
            </div>
            <div className="mt-6">
              <Link href={`/projects/${study.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:underline">
                Read the engagement detail
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
