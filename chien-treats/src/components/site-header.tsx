"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigation } from "@/content/site";
import { LogoMark, WordMark } from "./logo";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
        <Link href="/" className="group inline-flex items-center gap-2" prefetch={false}>
          <LogoMark className="h-9 w-9 drop-shadow-card transition-transform duration-200 group-hover:scale-105" />
          <WordMark className="hidden sm:inline-flex" />
          <span className="sr-only">Coral Hosts home</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          {navigation.primary.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative inline-flex items-center gap-1 rounded-sm px-1 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-secondary-400",
                  isActive ? "text-primary-600" : "text-slate-600 hover:text-primary-600",
                )}
              >
                {item.label}
                {isActive ? (
                  <span className="absolute inset-x-1 bottom-0 h-[2px] rounded-full bg-primary-500" aria-hidden />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/contact"
            className="inline-flex items-center rounded-md bg-primary-500 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2"
          >
            Schedule a call
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-md border border-slate-300 p-2 text-slate-600 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-400 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          <span className="sr-only">Toggle navigation</span>
          {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
        </button>
      </div>

      <nav
        id="mobile-menu"
        aria-label="Mobile navigation"
        className={cn(
          "border-t border-slate-200 bg-surface px-4 pb-4 pt-2 shadow-soft transition-all md:hidden",
          open ? "visible opacity-100" : "invisible h-0 opacity-0",
        )}
      >
        <ul className="space-y-3 text-base font-medium">
          {navigation.primary.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block rounded-md px-2 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-400",
                    isActive ? "bg-secondary-50 text-primary-600" : "hover:bg-secondary-50 hover:text-primary-600",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li>
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="block rounded-md bg-primary-500 px-3 py-3 text-center text-sm font-semibold text-white shadow-soft hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
            >
              Schedule a call
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
