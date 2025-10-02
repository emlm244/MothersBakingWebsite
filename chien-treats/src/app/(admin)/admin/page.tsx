"use client";

import { useEffect, useState } from "react";
import { useDataProvider } from "@/lib/data-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@ui";

interface MetricCardProps {
  label: string;
  value: string;
  description: string;
}

function MetricCard({ label, value, description }: MetricCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="font-brand text-3xl text-brown">{value}</p>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const provider = useDataProvider();
  const [metrics, setMetrics] = useState({ products: 0, orders: 0, tickets: 0, reviewsPending: 0 });

  useEffect(() => {
    let cancelled = false;
    if (!provider) return;

    async function load() {
      const productList = await provider.listProducts();
      const [orders, ticketSummary, pendingReviews] = await Promise.all([
        provider.listOrders(),
        provider.listTickets({ pageSize: 1 }).then((res) => res.total),
        Promise.all(productList.map((product) => provider.listReviews(product.id, "pending"))).then((lists) =>
          lists.reduce((count, list) => count + list.length, 0)
        ),
      ]);
      if (cancelled) return;
      setMetrics({
        products: productList.length,
        orders: orders.length,
        tickets: ticketSummary,
        reviewsPending: pendingReviews,
      });
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [provider]);

  if (!provider) {
    return <p>Loading metrics...</p>;
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-brand text-3xl text-brown">Welcome back</h1>
        <p className="text-sm text-brown/70">
          Monitor orders, tickets, and reviews. Swap roles via Dev Tools to test permissions.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Products" value={String(metrics.products)} description="Active SKUs" />
        <MetricCard label="Orders" value={String(metrics.orders)} description="Demo orders recorded" />
        <MetricCard label="Tickets" value={String(metrics.tickets)} description="Support tickets" />
        <MetricCard label="Pending reviews" value={String(metrics.reviewsPending)} description="Awaiting moderation" />
      </div>
    </div>
  );
}
