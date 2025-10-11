import { company, leadership } from "@/content/site";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "About Coral Hosts",
  description: "Meet the reliability engineers, operators, and performance specialists keeping Coral Hosts partners online.",
  path: "/about",
});

const values = [
  {
    title: "People-first operations",
    body: "Runbooks, dashboards, and alerts are written in plain language so stakeholders know what to do at 3AM.",
  },
  {
    title: "Measured accountability",
    body: "We report on uptime, vitals, and incidents alongside your business KPIs. No vanity metrics.",
  },
  {
    title: "Security without drama",
    body: "Least privilege, encrypted secrets, and audited workflows are part of every engagement—not an upsell.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-16 px-4 py-16 md:px-6">
      <header className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">About</p>
        <h1 className="font-display text-4xl text-navy-900">We operate the dependable web so you can create on it</h1>
        <p className="max-w-3xl text-base text-slate-600">
          Coral Hosts is a fully-remote team of reliability engineers, performance specialists, and product-minded operators. We help marketing, growth, and product teams launch quickly while staying ready for security reviews and board slides.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        {values.map((value) => (
          <article key={value.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="font-display text-xl text-navy-900">{value.title}</h2>
            <p className="mt-3 text-sm text-slate-600">{value.body}</p>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
        <h2 className="font-display text-3xl text-navy-900">Leadership</h2>
        <p className="mt-3 text-sm text-slate-600">
          Every engagement has a named delivery lead, reliability owner, and performance partner. Meet the folks who stay on-call with you.
        </p>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {leadership.map((person) => (
            <article key={person.name} className="rounded-xl bg-surface-muted/60 p-5 text-sm text-slate-600 shadow-xs">
              <h3 className="font-display text-lg text-navy-900">{person.name}</h3>
              <p className="text-xs uppercase tracking-[0.2em] text-secondary-600">{person.role}</p>
              <p className="mt-3">{person.bio}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="font-display text-3xl text-navy-900">Certifications & assurances</h2>
        <ul className="grid gap-4 md:grid-cols-2">
          {company.certifications.map((item) => (
            <li key={item} className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-soft">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-3xl bg-gradient-to-br from-primary-50 via-surface to-secondary-50 p-8 shadow-hero">
        <h2 className="font-display text-2xl text-navy-900">Work with us</h2>
        <p className="mt-3 text-sm text-slate-600">
          We maintain a short waitlist so teams get dedicated attention. Share your goals and current stack—if we aren't the right fit, we'll connect you with a partner who is.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="https://cal.com/coral-hosts/intro"
            rel="noopener noreferrer"
            target="_blank"
            className="inline-flex items-center gap-2 rounded-md border border-secondary-400 px-5 py-3 text-sm font-semibold text-secondary-600 transition hover:bg-secondary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-400 focus-visible:ring-offset-2"
          >
            Meet the founders
          </a>
          <a
            href="mailto:hello@coralhosts.com"
            className="inline-flex items-center rounded-md bg-primary-500 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2"
          >
            Email hello@coralhosts.com
          </a>
        </div>
      </section>
    </div>
  );
}
