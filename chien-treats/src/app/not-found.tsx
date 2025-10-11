import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-4xl flex-col items-start justify-center gap-6 px-4 py-16 md:px-6">
      <span className="inline-flex items-center rounded-full bg-secondary-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-secondary-600">
        404
      </span>
      <h1 className="font-display text-4xl text-navy-900">We couldn&apos;t find that page.</h1>
      <p className="max-w-xl text-sm text-slate-600">
        The content you&apos;re looking for may have moved. Explore our services or drop us a note and we&apos;ll point you in the right direction.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/services"
          className="inline-flex items-center rounded-md bg-primary-500 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2"
        >
          View services
        </Link>
        <Link
          href="/contact"
          className="inline-flex items-center rounded-md border border-secondary-400 px-5 py-3 text-sm font-semibold text-secondary-600 transition hover:bg-secondary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-400 focus-visible:ring-offset-2"
        >
          Contact us
        </Link>
      </div>
    </div>
  );
}
