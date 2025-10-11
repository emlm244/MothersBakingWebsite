import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SiteShell } from "@/components/site-shell";
import { company } from "@/content/site";
import { siteConfig } from "@/lib/config";
import { organizationSchema, projectSchemas, serviceSchemas, websiteSchema } from "@/lib/schema";

const geist = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-display",
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.baseUrl),
  title: {
    default: `${company.name} | Managed web hosting for ambitious teams`,
    template: `%s | ${company.name}`,
  },
  description: company.description,
  keywords: [
    "managed hosting",
    "WordPress hosting",
    "marketing site performance",
    "web operations",
    "Cloudflare partner",
    "SRE for marketing teams",
  ],
  openGraph: {
    title: company.name,
    description: company.description,
    url: siteConfig.baseUrl,
    siteName: company.name,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${siteConfig.baseUrl}/brand/coral-hosts-logomark.svg`,
        width: 512,
        height: 512,
        alt: `${company.name} social preview`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: company.name,
    description: company.description,
    images: [`${siteConfig.baseUrl}/brand/coral-hosts-logomark.svg`],
  },
  alternates: {
    canonical: siteConfig.baseUrl,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const schema = [organizationSchema(), websiteSchema(), ...serviceSchemas(), ...projectSchemas()];

  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/brand/coral-hosts-favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/brand/coral-hosts-favicon.svg" />
        <link rel="preconnect" href="https://fonts.bunny.net" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </head>
      <body className="bg-background text-slate-800 antialiased">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
