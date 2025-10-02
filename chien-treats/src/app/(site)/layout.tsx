import Link from "next/link";
import { ReactNode } from "react";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-cream min-h-screen">
      <header className="bg-cream/90 backdrop-blur border-b border-brown/10 sticky top-0 z-40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-brand text-2xl text-brown">
            Chien&apos;s Treats
          </Link>
          <nav aria-label="Main navigation" className="flex items-center gap-6 text-sm font-medium">
            <Link href="/shop" className="hover:text-pink focus-visible:text-pink">
              Shop
            </Link>
            <Link href="/custom-orders" className="hover:text-pink focus-visible:text-pink">
              Custom Orders
            </Link>
            <Link href="/reviews" className="hover:text-pink focus-visible:text-pink">
              Reviews
            </Link>
            <Link href="/cart" className="hover:text-pink focus-visible:text-pink">
              Cart
            </Link>
            <Link
              href="/support/new"
              className="rounded-full bg-pink px-4 py-2 text-white shadow-soft hover:bg-pink-600 focus-visible:bg-pink-600"
            >
              Support
            </Link>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
      <footer className="border-t border-brown/10 bg-cream">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-8 text-sm text-brown/80 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Chien&apos;s Treats. All rights reserved.</p>
          <div className="flex items-center gap-4">
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

