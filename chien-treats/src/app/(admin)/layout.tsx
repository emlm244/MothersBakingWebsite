"use client";

import Link from "next/link";
import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loadUser, logout } from "@/features/auth/authSlice";

const ALLOWED_ROLES = new Set(["admin", "support", "staff"]);

// Development bypass: Allow admin access when no backend is configured
const DEV_BYPASS = process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_API_URL === undefined;

function AdminGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!user && !loading && !DEV_BYPASS) {
      dispatch(loadUser());
    }
  }, [dispatch, user, loading]);

  useEffect(() => {
    if (!loading && !user && !DEV_BYPASS) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const isAllowed = DEV_BYPASS || (user && ALLOWED_ROLES.has(user.role));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink mx-auto mb-4"></div>
          <p className="text-brown/70">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAllowed) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-6 px-6 text-center">
          <h1 className="font-brand text-3xl text-brown">Admin access required</h1>
          <p className="text-sm text-brown/70">
            You need an admin, support, or staff role to view the admin console. Please sign in with an admin account.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => {
                dispatch(logout());
                router.push("/login");
              }}
              className="rounded-full border border-pink px-5 py-2 text-sm font-medium text-pink transition hover:bg-pink hover:text-white focus-visible:bg-pink focus-visible:text-white"
            >
              Sign in as admin
            </button>
            <Link
              href="/"
              className="rounded-full border border-brown/20 px-5 py-2 text-sm font-medium text-brown/70 transition hover:border-brown hover:text-brown"
            >
              Back to storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const userEmail = useAppSelector((state) => state.auth.user?.email);

  return (
    <AdminGate>
      <div className="min-h-screen bg-cream">
        <header className="border-b border-brown/10 bg-white/80 py-4 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
            <div>
              <Link href="/admin" className="font-brand text-2xl text-brown">
                Admin - Chien&apos;s Treats
              </Link>
              {DEV_BYPASS && (
                <div className="mt-1 text-xs text-yellow">
                  Development Mode (No Auth)
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-brown/70">{userEmail || (DEV_BYPASS ? "dev@local" : "")}</span>
              {!DEV_BYPASS && (
                <button
                  onClick={() => {
                    dispatch(logout());
                    router.push("/");
                  }}
                  className="text-sm text-pink hover:text-pink-600 focus-visible:text-pink-600"
                >
                  Logout
                </button>
              )}
              <Link href="/" className="text-sm text-brown/70 hover:text-brown focus-visible:text-brown">
                View site
              </Link>
            </div>
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
