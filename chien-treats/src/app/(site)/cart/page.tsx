"use client";

import { ChangeEvent } from "react";
import Link from "next/link";
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Input, Label } from "@ui";
import { useCart, useCartSummary } from "@/features/cart/hooks";

export default function CartPage() {
  const { cart, setCoupon, remove, update } = useCart();
  const summary = useCartSummary();

  const handleQuantityChange = (productId: string) => (event: ChangeEvent<HTMLInputElement>) => {
    update(productId, Number(event.target.value));
  };

  const handleCouponBlur = (event: ChangeEvent<HTMLInputElement>) => {
    setCoupon(event.target.value);
  };

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="font-brand text-4xl text-brown">Your cart</h1>
        <p className="text-brown/70">Tweak quantities, apply a coupon, and hop into checkout when you are ready.</p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Macarons selected</CardTitle>
            <CardDescription>
              {cart.items.length ? "You can adjust quantities below." : "Your cart is empty. Explore our shop for seasonal treats."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {summary.lines.map((line) => (
              <div key={line.product.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brown/10 bg-white/70 p-4 shadow-soft">
                <div>
                  <p className="font-brand text-lg text-brown">{line.product.name}</p>
                  <p className="text-xs uppercase tracking-wide text-brown/50">${(line.product.priceCents / 100).toFixed(2)} each</p>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`qty-${line.product.id}`} className="text-xs">
                    Qty
                  </Label>
                  <Input
                    id={`qty-${line.product.id}`}
                    type="number"
                    min={1}
                    max={48}
                    value={line.quantity}
                    onChange={handleQuantityChange(line.product.id)}
                    className="w-20"
                  />
                  <Button variant="ghost" onClick={() => remove(line.product.id)}>
                    Remove
                  </Button>
                </div>
              </div>
            ))}
            {cart.items.length === 0 ? (
              <Button asChild>
                <Link href="/shop">Browse macarons</Link>
              </Button>
            ) : null}
          </CardContent>
        </Card>

        <Card className="h-max">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
            <CardDescription>Demo checkout marks orders as paid when you choose demo mode.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-brown/70">
            <div className="space-y-1">
              <p className="flex justify-between"><span>Subtotal</span><span>{summary.formatted.subtotal}</span></p>
              <p className="flex justify-between"><span>Tax</span><span>{summary.formatted.tax}</span></p>
              <p className="flex justify-between"><span>Shipping</span><span>{summary.formatted.shipping}</span></p>
              {summary.discountCents > 0 ? (
                <p className="flex justify-between text-pink"><span>Discount</span><span>-{summary.formatted.discount}</span></p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="coupon">Coupon code</Label>
              <Input
                id="coupon"
                placeholder="WELCOME10"
                onBlur={handleCouponBlur}
              />
              {summary.appliedCoupon ? (
                <p className="text-xs text-green-700">Coupon applied!</p>
              ) : cart.couponCode ? (
                <p className="text-xs text-red">We could not find that coupon.</p>
              ) : null}
            </div>
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-3">
            <div className="flex justify-between font-brand text-xl text-brown">
              <span>Total</span>
              <span>{summary.formatted.total}</span>
            </div>
            <Button asChild disabled={cart.items.length === 0} className="w-full">
              <Link href="/checkout">Proceed to checkout</Link>
            </Button>
          </CardFooter>
        </Card>
      </section>
    </div>
  );
}
