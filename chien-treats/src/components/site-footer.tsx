import Link from "next/link";
import { company, navigation } from "@/content/site";
import { LogoMark, WordMark } from "./logo";
import { absoluteUrl } from "@/lib/metadata";

const socials = [
  { label: "LinkedIn", href: "https://www.linkedin.com/company/coral-hosts" },
  { label: "GitHub", href: "https://github.com/coral-hosts" },
  { label: "YouTube", href: "https://youtube.com/@coralhosts" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-surface-muted/70">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[1.2fr_1fr_1fr] md:px-6 lg:gap-16">
        <div className="space-y-4">
          <Link href="/" className="inline-flex items-center gap-2" prefetch={false}>
            <LogoMark className="h-8 w-8" />
            <WordMark />
          </Link>
          <p className="max-w-sm text-sm text-slate-600">{company.description}</p>
          <ul className="text-sm text-slate-600">
            <li>
              Sales:{" "}
              <a className="font-medium text-primary-600 hover:underline" href={`mailto:${company.contacts.sales.email}`}>
                {company.contacts.sales.email}
              </a>
            </li>
            <li>
              Support:{" "}
              <a className="font-medium text-primary-600 hover:underline" href={`mailto:${company.contacts.support.email}`}>
                {company.contacts.support.email}
              </a>
            </li>
            <li>Phone: <a className="font-medium text-primary-600 hover:underline" href={`tel:${company.contacts.sales.phone}`}>{company.contacts.sales.phone}</a></li>
            <li>Response SLA: {company.responseSla}</li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Navigate</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {[...navigation.primary, ...navigation.secondary].map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-primary-600 hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Stay in touch</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {socials.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="hover:text-primary-600 hover:underline" rel="noopener noreferrer" target="_blank">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-md bg-white/80 p-4 text-xs text-slate-500 shadow-xs">
            <p className="font-semibold text-slate-600">Status updates</p>
            <p>Subscribe to maintenance alerts and incident reports at{" "}
              <a href={absoluteUrl("/status")} className="font-medium text-primary-600 hover:underline">
                status.coralhosts.com
              </a>
            </p>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-200/60 bg-surface py-4">
        <p className="mx-auto max-w-6xl px-4 text-xs text-slate-500 md:px-6">
          © {new Date().getFullYear()} {company.name}. Crafted for compliance-ready, high-performance web experiences. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
