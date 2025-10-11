import { caseStudies } from "@/content/site";
import { createMetadata } from "@/lib/metadata";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return caseStudies.map((study) => ({ slug: study.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const study = caseStudies.find((item) => item.slug === slug);
  if (!study) {
    return createMetadata({
      title: "Case study",
      description: "Project not found",
      path: "/projects",
    });
  }

  return createMetadata({
    title: `${study.client} — ${study.title}`,
    description: study.summary,
    path: `/projects/${study.slug}`,
    type: "article",
  });
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = caseStudies.find((item) => item.slug === slug);
  if (!study) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-12 px-4 py-16 md:px-6">
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.25em] text-slate-500">
          <li>
            <Link href="/" className="hover:text-primary-600">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link href="/projects" className="hover:text-primary-600">
              Case studies
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="font-semibold text-primary-600">{study.title}</li>
        </ol>
      </nav>

      <header className="space-y-4">
        <span className="rounded-full bg-secondary-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-secondary-600">
          {study.industry}
        </span>
        <h1 className="font-display text-4xl text-navy-900">{study.title}</h1>
        <p className="text-base text-slate-600">{study.summary}</p>
        <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
          <span>Client: {study.client}</span>
          <span className="mx-3">•</span>
          <span>Year: {study.year}</span>
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-[1.2fr,0.8fr]">
        <article className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Challenge</h2>
          <p className="text-sm text-slate-600">{study.problem}</p>
        </article>
        <aside className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Services used</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            {study.services.map((svc) => (
              <li key={svc} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary-500" aria-hidden />
                <span>{svc}</span>
              </li>
            ))}
          </ul>
        </aside>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Approach</h2>
        <ol className="space-y-3 text-sm text-slate-600">
          {study.approach.map((step, index) => (
            <li key={step} className="flex gap-3">
              <span className="font-display text-lg text-primary-600">{index + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {study.outcomeMetrics.map((metric) => (
          <div key={metric.label} className="rounded-2xl bg-surface-muted/80 p-5 text-sm shadow-xs">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{metric.label}</p>
            <p className="mt-1 font-display text-2xl text-primary-600">{metric.value}</p>
            <p className="text-xs text-slate-500">{metric.detail}</p>
          </div>
        ))}
      </section>

      <blockquote className="rounded-3xl border-l-4 border-primary-400 bg-primary-50/60 p-6 text-lg text-primary-700 shadow-soft">
        “{study.quote.body}”
        <footer className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary-600">
          — {study.quote.author}, {study.quote.role}
        </footer>
      </blockquote>

      <section className="rounded-3xl bg-gradient-to-br from-primary-50 via-surface to-secondary-50 p-8 shadow-hero">
        <h2 className="font-display text-2xl text-navy-900">Need similar outcomes?</h2>
        <p className="mt-3 text-sm text-slate-600">
          We created custom runbooks, automations, and observability for this engagement. Let&apos;s discuss how Coral Hosts can extend your team.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/contact"
            className="inline-flex items-center rounded-md bg-primary-500 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2"
          >
            Start a conversation
          </Link>
          <Link
            href="/services"
            className="inline-flex items-center rounded-md border border-secondary-400 px-5 py-3 text-sm font-semibold text-secondary-600 transition hover:bg-secondary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-400 focus-visible:ring-offset-2"
          >
            Explore our services
          </Link>
        </div>
      </section>
    </div>
  );
}
