"use client";

import { useMemo, useState } from "react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from "@ui";
import { useProducts } from "@/features/products/useProducts";
import { useCart } from "@/features/cart/hooks";

export default function CustomOrdersPage() {
  const { products } = useProducts();
  const { add } = useCart();
  const [eventDate, setEventDate] = useState("");
  const [selection, setSelection] = useState<Record<string, number>>({});

  const totalQty = useMemo(() => Object.values(selection).reduce((sum, qty) => sum + qty, 0), [selection]);

  const estimatedCostCents = useMemo(() => {
    return Object.entries(selection).reduce((sum, [productId, qty]) => {
      const product = products.find((item) => item.id === productId);
      if (!product) return sum;
      return sum + product.priceCents * qty;
    }, 0);
  }, [selection, products]);

  const updateQty = (productId: string, qty: number) => {
    setSelection((prev) => {
      if (qty <= 0) {
        const updated = { ...prev };
        delete updated[productId];
        return updated;
      }
      return { ...prev, [productId]: qty };
    });
  };

  const addToCart = () => {
    Object.entries(selection).forEach(([productId, qty]) => {
      add(productId, qty);
    });
    setSelection({});
    setEventDate("");
  };

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <h1 className="font-brand text-4xl text-brown">Custom macaron boxes</h1>
        <p className="text-brown/70">
          Blend flavors, select pickup dates, and leave notes for our baker to create the sweetest centerpiece.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Choose flavors</CardTitle>
            <CardDescription>Select quantities per flavor. Minimum order is 6 macarons.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="flex items-center justify-between gap-4 rounded-2xl border border-brown/10 bg-white/60 p-4 shadow-soft">
                <div>
                  <p className="font-brand text-lg text-brown">{product.name}</p>
                  <p className="text-xs uppercase tracking-wide text-brown/50">{product.tags.join(", ") || "seasonal"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`qty-${product.id}`} className="text-xs">Qty</Label>
                  <Input
                    id={`qty-${product.id}`}
                    type="number"
                    min={0}
                    max={48}
                    value={selection[product.id] ?? 0}
                    onChange={(event) => updateQty(product.id, Number(event.target.value))}
                    className="w-20"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="h-max">
          <CardHeader>
            <CardTitle>Your tasting box</CardTitle>
            <CardDescription>We recommend multiples of 6 for gorgeous tiers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1 text-sm text-brown/70">
              <p>Total macarons: {totalQty}</p>
              <p>Estimated cost: ${(estimatedCostCents / 100).toFixed(2)}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventDate">Event date</Label>
              <Input
                id="eventDate"
                type="date"
                value={eventDate}
                onChange={(event) => setEventDate(event.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={addToCart}
              disabled={totalQty < 6}
            >
              Add to cart
            </Button>
            <p className="text-xs text-brown/60">
              Add this custom box to your cart. At checkout you can leave detailed notes for fillings and display colors.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
