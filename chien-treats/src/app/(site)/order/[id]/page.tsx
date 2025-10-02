"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from "@ui";
import { useDataProvider } from "@/lib/data-provider";
import { formatCurrency, formatIsoDate } from "@/lib/utils";

export default function OrderConfirmationPage() {
  const params = useParams<{ id: string }>();
  const provider = useDataProvider();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Awaited<ReturnType<typeof provider.getOrder>>>(null);

  useEffect(() => {
    let cancelled = false;
    const orderId = params?.id;
    if (!orderId) {
      setLoading(false);
      setOrder(null);
      return;
    }

    async function load() {
      setLoading(true);
      try {
        const result = await provider.getOrder(orderId);
        if (cancelled) return;
        if (!result) {
          setError("We could not find that order.");
        }
        setOrder(result);
      } catch (err) {
        if (!cancelled) {
          setError((err as Error).message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [provider, params]);

  if (loading) {
    return <p className="text-brown/70">Loading your confirmation...</p>;
  }

  if (!order) {
    return <p className="text-brown/70">{error ?? "Order not found."}</p>;
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="font-brand text-4xl text-brown">Thank you!</h1>
        <p className="text-brown/70">Order <strong>{order.number}</strong> is marked demo-paid. We will reach out within 24 hours.</p>
        <Button asChild variant="outline" size="sm">
          <a href="/support/new">Need help? Open a ticket</a>
        </Button>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Order summary</CardTitle>
            <CardDescription>Placed {formatIsoDate(order.createdAt)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-brown/70">
            <ul className="space-y-2">
              {order.items.map((item) => (
                <li key={item.productId} className="flex justify-between">
                  <span>{item.name} × {item.qty}</span>
                  <span>{formatCurrency(item.priceCents * item.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between font-brand text-lg text-brown">
              <span>Total</span>
              <span>{formatCurrency(order.totalCents)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer & delivery</CardTitle>
            <CardDescription>{order.shipping?.method === "delivery" ? "We will reach out with courier details." : "Pickup instructions arrive via email."}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-brown/70">
            <p><strong>Name:</strong> {order.customer.name}</p>
            <p><strong>Email:</strong> {order.customer.email}</p>
            {order.customer.phone ? <p><strong>Phone:</strong> {order.customer.phone}</p> : null}
            <p><strong>Method:</strong> {order.shipping?.method ?? "pickup"}</p>
            {order.shipping?.address ? <p><strong>Address:</strong> {order.shipping.address}</p> : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
