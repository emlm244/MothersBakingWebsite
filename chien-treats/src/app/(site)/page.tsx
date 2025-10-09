"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from "@ui";
import { useProducts } from "@/features/products/useProducts";
import { useCart } from "@/features/cart/hooks";
import { useAllReviews } from "@/features/reviews/useAllReviews";
import { useNewsletterSignup } from "@/features/newsletter/useNewsletter";

export default function HomePage() {
  const { products } = useProducts();
  const featured = useMemo(() => products.slice(0, 3), [products]);
  const reviews = useAllReviews("approved").slice(0, 3);
  const { add } = useCart();
  const [email, setEmail] = useState("");
  const newsletter = useNewsletterSignup();

  return (
    <div className="space-y-12">
      <section className="rounded-3xl bg-pink/15 p-10 shadow-soft">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr]">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.3em] text-brown/70">Cozy macaron moments</p>
            <h1 className="font-brand text-4xl text-brown md:text-5xl">
              Sweet treats crafted by hand in our Capitol Hill kitchen.
            </h1>
            <p className="max-w-xl text-lg text-brown/85">
              Explore seasonal macarons, build custom boxes, and lean on our support team for events, gifting, and celebrations.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild>
                <Link href="/shop">Shop macarons</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/custom-orders">Build a custom box</Link>
              </Button>
            </div>
          </div>
          <Card className="bg-white/80">
            <CardHeader>
              <CardTitle>Baker's promise</CardTitle>
              <CardDescription>Pastel shells. Silky fillings. Joy guaranteed.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-brown/70">
              <p>- Hand piped shells baked daily.</p>
              <p>- Locally sourced fruit purees & teas.</p>
              <p>- Free pickup in Capitol Hill studio.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section aria-labelledby="featured-products" className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 id="featured-products" className="font-brand text-2xl text-brown">
            Featured flavors
          </h2>
          <Link className="text-sm font-semibold text-pink hover:text-pink-600 focus-visible:text-pink-600" href="/shop">
            View all
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {featured.length ? (
            featured.map((product) => (
              <Card key={product.id} className="space-y-4">
                <CardHeader>
                  <CardTitle>{product.name}</CardTitle>
                  {product.subtitle ? <CardDescription>{product.subtitle}</CardDescription> : null}
                </CardHeader>
                <CardContent className="space-y-3">
                  <img
                    src={product.images[0] ?? ""}
                    alt={`${product.name} macaron art`}
                    className="h-auto w-full rounded-2xl"
                  />
                  <p className="text-sm text-brown/70">{product.descriptionMd.split("\n")[0]}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-brand text-xl text-brown">${(product.priceCents / 100).toFixed(2)}</span>
                    <Button size="sm" onClick={() => add(product.id, 1)}>
                      Add to cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-brown/70">Loading flavors...</p>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-brown/10 bg-white p-8 shadow-soft">
        <div className="grid gap-6 md:grid-cols-[1fr_1fr]">
          <div className="space-y-3">
            <h2 className="font-brand text-2xl text-brown">Kind words from the community</h2>
            <p className="text-sm text-brown/70">Approved reviews appear after moderation. Leave yours after checkout.</p>
          </div>
          <ul className="space-y-4 text-sm text-brown/80">
            {reviews.length ? (
              reviews.map((review) => (
                <li key={review.id} className="rounded-2xl bg-cream p-4 shadow-soft">
                  <p className="font-semibold text-brown">{review.userName}</p>
                  <p className="text-xs text-brown/50">{"*".repeat(review.rating)}</p>
                  <p className="mt-2">{review.body}</p>
                </li>
              ))
            ) : (
              <li>Reviews are on the way!</li>
            )}
          </ul>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle>How it works</CardTitle>
            <CardDescription>Order macarons in three simple steps.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div>
              <h3 className="font-brand text-lg text-brown">Browse</h3>
              <p className="text-sm text-brown/70">Explore our seasonal flavors and read customer reviews.</p>
            </div>
            <div>
              <h3 className="font-brand text-lg text-brown">Customize</h3>
              <p className="text-sm text-brown/70">Build custom boxes, apply coupons, and schedule pickup.</p>
            </div>
            <div>
              <h3 className="font-brand text-lg text-brown">Support</h3>
              <p className="text-sm text-brown/70">Questions? Contact our team for events and special orders.</p>
            </div>
          </CardContent>
        </Card>
        <Card className="self-start">
          <CardHeader>
            <CardTitle>Join the tasting club</CardTitle>
            <CardDescription>Monthly drop alerts and behind-the-scenes photos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-label="Email address"
            />
            <Button
              type="button"
              onClick={() => {
                if (!email) return;
                newsletter.submit(email);
                setEmail("");
              }}
              disabled={newsletter.status === "loading"}
            >
              {newsletter.status === "loading" ? "Joining..." : "Join newsletter"}
            </Button>
            {newsletter.message ? (
              <p className={`text-sm ${newsletter.status === "error" ? "text-red" : "text-green-700"}`}>
                {newsletter.message}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
