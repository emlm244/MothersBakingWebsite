"use client";

import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from "@ui";
import { useDataProvider } from "@/lib/data-provider";
import type { Coupon } from "@data";

export default function AdminCouponsPage() {
  const provider = useDataProvider();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [form, setForm] = useState({ code: "", pctOff: 10 });

  const load = useCallback(async () => {
    if (!provider) return;
    const list = await provider.listCoupons();
    setCoupons(list);
  }, [provider]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCodeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, code: event.target.value }));
  };

  const handlePctChange = (event: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, pctOff: Number(event.target.value) }));
  };

  async function saveCoupon() {
    if (!provider || !form.code.trim()) return;
    await provider.upsertCoupon({ code: form.code.trim().toUpperCase(), pctOff: form.pctOff, active: true });
    setForm({ code: "", pctOff: 10 });
    void load();
  }

  async function toggleCoupon(coupon: Coupon) {
    if (!provider) return;
    await provider.upsertCoupon({ ...coupon, active: !coupon.active });
    void load();
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-brand text-3xl text-brown">Coupons</h1>
        <p className="text-sm text-brown/70">Manage demo discount codes.</p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Create coupon</CardTitle>
          <CardDescription>Percent discounts apply to the subtotal before tax.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="code">Code</Label>
            <Input id="code" value={form.code} onChange={handleCodeChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pct">Percent off</Label>
            <Input id="pct" type="number" value={form.pctOff} onChange={handlePctChange} />
          </div>
          <div className="md:col-span-2">
            <Button type="button" onClick={saveCoupon}>Save coupon</Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Existing coupons</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {coupons.length ? (
            coupons.map((coupon) => (
              <div key={coupon.code} className="flex items-center justify-between rounded-2xl border border-brown/10 bg-white p-4 shadow-soft">
                <div>
                  <p className="font-brand text-lg text-brown">{coupon.code}</p>
                  <p className="text-sm text-brown/70">{coupon.pctOff ? `${coupon.pctOff}% off` : `$${coupon.amountOffCents ? (coupon.amountOffCents / 100).toFixed(2) : 0} off`}</p>
                </div>
                <Button variant="outline" onClick={() => toggleCoupon(coupon)}>
                  {coupon.active ? "Deactivate" : "Activate"}
                </Button>
              </div>
            ))
          ) : (
            <p className="text-brown/70">No coupons yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
