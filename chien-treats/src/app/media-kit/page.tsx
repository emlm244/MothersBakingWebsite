import { mediaAssets } from "@/content/site";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Media Kit",
  description: "Download Coral Hosts logos, brand assets, and leadership bios.",
  path: "/media-kit",
});

export default function MediaKitPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-10 px-4 py-16 md:px-6">
      <header className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Media & press</p>
        <h1 className="font-display text-4xl text-navy-900">Brand assets & resources</h1>
        <p className="text-sm text-slate-600">
          Use these assets when referencing Coral Hosts in articles, case studies, or partner materials. Need something else? Email <a className="text-primary-600 hover:underline" href="mailto:press@coralhosts.com">press@coralhosts.com</a>.
        </p>
      </header>
      <section className="grid gap-6 md:grid-cols-2">
        {mediaAssets.map((asset) => (
          <article key={asset.href} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="font-display text-xl text-navy-900">{asset.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{asset.description}</p>
            <a
              href={asset.href}
              download
              className="mt-4 inline-flex items-center rounded-md border border-secondary-400 px-4 py-2 text-sm font-semibold text-secondary-600 transition hover:bg-secondary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-400 focus-visible:ring-offset-2"
            >
              Download
            </a>
          </article>
        ))}
      </section>
    </div>
  );
}
