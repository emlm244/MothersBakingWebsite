import type { Metadata } from "next";
import { Nunito, Inter } from "next/font/google";
import "./globals.css";
import { AppProviders } from "./providers";

const brand = Nunito({
  subsets: ["latin"],
  variable: "--font-brand",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://chienstreats.com"),
  title: {
    default: "Chien's Treats | Artisan Macarons in Seattle",
    template: "%s | Chien's Treats",
  },
  description:
    "Seattle's cozy macaron bakery on Capitol Hill. Hand-crafted French macarons with seasonal flavors, custom boxes, and local pickup. Order online today!",
  keywords: ["macarons", "bakery", "Seattle bakery", "Capitol Hill", "French pastry", "custom desserts", "macarons Seattle"],
  openGraph: {
    title: "Chien's Treats | Artisan Macarons in Seattle",
    description:
      "Hand-crafted French macarons with seasonal flavors. Custom boxes, local pickup on Capitol Hill. Browse our flavors and order online.",
    type: "website",
    locale: "en_US",
    siteName: "Chien's Treats",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Chien's Treats - Artisan Macarons",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Chien's Treats | Artisan Macarons in Seattle",
    description: "Hand-crafted French macarons on Capitol Hill. Custom boxes & seasonal flavors.",
    images: ["/og-image.svg"],
  },
  alternates: {
    canonical: "https://chienstreats.com",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "Bakery",
    "name": "Chien's Treats",
    "image": "https://chienstreats.com/og-image.svg",
    "description": "Artisan macaron bakery specializing in custom boxes, seasonal flavors, and celebration desserts.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "714 E Pine St",
      "addressLocality": "Seattle",
      "addressRegion": "WA",
      "postalCode": "98122",
      "addressCountry": "US"
    },
    "telephone": "+1-206-555-0184",
    "email": "hello@chiens.treats",
    "url": "https://chienstreats.com",
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday"],
        "opens": "10:00",
        "closes": "18:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Friday",
        "opens": "10:00",
        "closes": "19:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Saturday",
        "opens": "09:00",
        "closes": "17:00"
      }
    ],
    "priceRange": "$$",
    "servesCuisine": ["French", "Desserts"],
    "acceptsReservations": false,
    "paymentAccepted": "Cash, Credit Card"
  };

  return (
    <html lang="en" className={`${brand.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
      </head>
      <body className="min-h-screen bg-bg text-brown">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-pink text-white px-4 py-2 rounded-md shadow-soft z-50"
        >
          Skip to main content
        </a>
        <AppProviders>
          <div id="portal-root" />
          <main id="main" className="min-h-screen">
            {children}
          </main>
        </AppProviders>
      </body>
    </html>
  );
}
