"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { useSession } from "@/features/session/useSession";

const ALLOWED_ROLES = new Set(["admin", "support", "staff"]);

function AdminGate({ children }: { children: ReactNode }) {
  const { session } = useSession();
  const isAllowed = ALLOWED_ROLES.has(session.role);

  if (!isAllowed) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-6 px-6 text-center">
          <h1 className="font-brand text-3xl text-brown">Admin access required</h1>
          <p className="text-sm text-brown/70">
            You need an admin, support, or staff role to view the console. Use the Dev Tools role switcher or
            return to the storefront.
          </p>
          <Link
            href="/"
            className="rounded-full border border-pink px-5 py-2 text-sm font-medium text-pink transition hover:bg-pink hover:text-white focus-visible:bg-pink focus-visible:text-white"
          >
            Back to storefront
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminGate>
      <div className="min-h-screen bg-cream">
        <header className="border-b border-brown/10 bg-white/80 py-4 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
            <Link href="/admin" className="font-brand text-2xl text-brown">
              Admin - Chien&apos;s Treats
            </Link>
            <Link href="/" className="text-sm text-pink hover:text-pink-600 focus-visible:text-pink-600">
              View site
            </Link>
          </div>
        </header>
        <div className="mx-auto grid max-w-6xl gap-6 px-6 py-10 lg:grid-cols-[220px_1fr]">
          <nav aria-label="Admin navigation" className="flex flex-row flex-wrap gap-3 lg:flex-col">
            {[
              { href: "/admin", label: "Dashboard" },
              { href: "/admin/products", label: "Products" },
              { href: "/admin/orders", label: "Orders" },
              { href: "/admin/reviews", label: "Reviews" },
              { href: "/admin/content", label: "Content" },
              { href: "/admin/coupons", label: "Coupons" },
              { href: "/admin/tickets", label: "Tickets" },
              { href: "/admin/dev-tools", label: "Dev Tools" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-brown/10 px-3 py-2 text-sm font-medium text-brown/85 transition hover:border-pink hover:text-pink focus-visible:border-pink focus-visible:text-pink"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <section className="rounded-3xl bg-white p-6 shadow-soft" aria-live="polite">
            {children}
          </section>
        </div>
      </div>
    </AdminGate>
  );
}
