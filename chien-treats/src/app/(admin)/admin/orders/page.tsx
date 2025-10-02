"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ui";
import { useDataProvider } from "@/lib/data-provider";
import type { Order } from "@data";
import { formatCurrency, formatIsoDate } from "@/lib/utils";

export default function AdminOrdersPage() {
  const provider = useDataProvider();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!provider) return;
    setLoading(true);
    const list = await provider.listOrders();
    setOrders(list);
    setLoading(false);
  }, [provider]);

  useEffect(() => {
    refresh().catch((err) => setError((err as Error).message));
  }, [refresh]);

  async function markRefunded(order: Order) {
    if (!provider) return;
    await provider.updateOrder({ ...order, payment: { ...order.payment, status: "refunded" }, updatedAt: new Date().toISOString() });
    refresh();
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-brand text-3xl text-brown">Orders</h1>
        <p className="text-sm text-brown/70">Demo orders appear here after checkout.</p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Order history</CardTitle>
          <CardDescription>Mark demo orders as refunded after showcasing flows.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-brown/70">Loading orders...</p>
          ) : orders.length ? (
            <table className="min-w-full text-sm text-brown/80">
              <thead>
                <tr className="text-left">
                  <th className="pb-2">Number</th>
                  <th className="pb-2">Customer</th>
                  <th className="pb-2">Total</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Placed</th>
                  <th className="pb-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brown/10">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="py-2 font-semibold text-brown">{order.number}</td>
                    <td className="py-2">{order.customer.name}</td>
                    <td className="py-2">{formatCurrency(order.totalCents)}</td>
                    <td className="py-2">{order.payment.status}</td>
                    <td className="py-2">{formatIsoDate(order.createdAt)}</td>
                    <td className="py-2 text-right">
                      <Button variant="outline" size="sm" onClick={() => markRefunded(order)} disabled={order.payment.status === "refunded"}>
                        Mark refunded
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-brown/70">No orders yet. Complete the checkout flow to seed one.</p>
          )}
          {error ? <p className="text-sm text-red">{error}</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}
