import Link from "next/link";
import Script from "next/script";
import { ReactNode } from "react";
import { MobileNav } from "@/components/MobileNav";

const BUSINESS_JSON = {
  "@context": "https://schema.org",
  "@type": "Bakery",
  name: "Chien's Treats",
  url: "https://chienstreats.com",
  image: "https://chienstreats.com/og-image.svg",
  telephone: "+1-206-555-0184",
  servesCuisine: ["French", "Dessert"],
  priceRange: "$$",
  sameAs: ["https://www.instagram.com/chiens.treats"],
  address: {
    "@type": "PostalAddress",
    streetAddress: "714 E Pine St",
    addressLocality: "Seattle",
    addressRegion: "WA",
    postalCode: "98122",
    addressCountry: "US",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 47.6155,
    longitude: -122.3208,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday"],
      opens: "10:00",
      closes: "18:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Friday"],
      opens: "10:00",
      closes: "19:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Saturday"],
      opens: "09:00",
      closes: "17:00",
    },
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "hello@chiens.treats",
    telephone: "+1-206-555-0184",
  },
};

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-cream min-h-screen">
      <header className="bg-cream/90 backdrop-blur border-b border-brown/10 sticky top-0 z-40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-brand text-2xl text-brown">
            Chien&apos;s Treats
          </Link>

          {/* Desktop navigation */}
          <nav aria-label="Main navigation" className="hidden md:flex items-center gap-5 text-sm font-medium">
            <Link href="/shop" className="hover:text-pink focus-visible:text-pink transition-colors">
              Shop
            </Link>
            <Link href="/custom-orders" className="hover:text-pink focus-visible:text-pink transition-colors">
              Custom Orders
            </Link>
            <Link href="/gallery" className="hover:text-pink focus-visible:text-pink transition-colors">
              Gallery
            </Link>
            <Link href="/about" className="hover:text-pink focus-visible:text-pink transition-colors">
              About
            </Link>
            <Link href="/visit" className="hover:text-pink focus-visible:text-pink transition-colors">
              Visit
            </Link>
            <Link href="/faq" className="hover:text-pink focus-visible:text-pink transition-colors">
              FAQ
            </Link>
            <Link href="/contact" className="hover:text-pink focus-visible:text-pink transition-colors">
              Contact
            </Link>
            <Link href="/reviews" className="hover:text-pink focus-visible:text-pink transition-colors">
              Reviews
            </Link>
            <Link href="/cart" className="hover:text-pink focus-visible:text-pink transition-colors">
              Cart
            </Link>
            <Link
              href="/support/new"
              className="rounded-full bg-pink px-4 py-2 text-white shadow-soft hover:bg-pink-600 focus-visible:bg-pink-600 transition-colors"
            >
              Support
            </Link>
          </nav>

          {/* Mobile navigation */}
          <MobileNav />
        </div>
      </header>
      <Script
        id="local-business"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(BUSINESS_JSON) }}
      />
      <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
      <footer className="border-t border-brown/10 bg-cream">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-8 text-sm text-brown/80 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Chien&apos;s Treats. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/contact" className="hover:text-pink focus-visible:text-pink">
              Contact
            </Link>
            <Link href="/visit" className="hover:text-pink focus-visible:text-pink">
              Visit
            </Link>
            <Link href="/legal/privacy" className="hover:text-pink focus-visible:text-pink">
              Privacy
            </Link>
            <Link href="/legal/terms" className="hover:text-pink focus-visible:text-pink">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

