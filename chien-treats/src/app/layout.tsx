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
  metadataBase: new URL("https://chiens-treats.example"),
  title: {
    default: "Chien's Treats | Cozy Macarons & Bakes",
    template: "%s | Chien's Treats",
  },
  description:
    "Chien's Treats is a cozy macaron bakery with custom boxes, seasonal flavors, and a caring support team.",
  keywords: ["macarons", "bakery", "custom desserts", "Chien's Treats"],
  openGraph: {
    title: "Chien's Treats",
    description:
      "Browse artisanal macarons, build custom boxes, and manage orders in the Chien's Treats experience.",
    type: "website",
    locale: "en_US",
  },
  alternates: {
    canonical: "https://chiens-treats.example",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${brand.variable} ${body.variable}`} suppressHydrationWarning>
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
