"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/custom-orders", label: "Custom Orders" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/visit", label: "Visit" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
  { href: "/reviews", label: "Reviews" },
  { href: "/cart", label: "Cart" },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  // Handle Escape key to close menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  // Focus first link when menu opens
  useEffect(() => {
    if (isOpen) {
      firstLinkRef.current?.focus();
    }
  }, [isOpen]);

  return (
    <>
      {/* Mobile menu button */}
      <button
        ref={menuButtonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden rounded-lg p-2 text-brown hover:bg-brown/5 focus-visible:bg-brown/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
      </button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <nav
            className="fixed top-16 right-0 bottom-0 w-64 bg-cream border-l border-brown/10 shadow-2xl z-50 md:hidden overflow-y-auto"
            aria-label="Mobile navigation"
          >
            <div className="flex flex-col gap-1 p-4">
              {NAV_LINKS.map((link, index) => (
                <Link
                  key={link.href}
                  ref={index === 0 ? firstLinkRef : null}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg px-4 py-3 text-brown hover:bg-pink/10 hover:text-pink focus-visible:bg-pink/10 focus-visible:text-pink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/support/new"
                onClick={() => setIsOpen(false)}
                className="mt-2 rounded-full bg-pink px-4 py-3 text-center text-white shadow-soft hover:bg-pink-600 focus-visible:bg-pink-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-600"
              >
                Support
              </Link>
            </div>
          </nav>
        </>
      )}
    </>
  );
}
