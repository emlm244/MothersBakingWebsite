"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Input, Label, TextArea } from "@ui";
import { useCart, useCartSummary } from "@/features/cart/hooks";
import { useDataProvider } from "@/lib/data-provider";
import { startCheckout } from "@/lib/payments/checkout";
import { useAnalytics } from "@/lib/analytics";

const checkoutSchema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  method: z.enum(["pickup", "delivery"]),
  address: z.string().optional(),
  notes: z.string().max(400).optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const provider = useDataProvider();
  const { cart, clear, setContact, setShipping } = useCart();
  const summary = useCartSummary();
  const { track } = useAnalytics();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: cart.contact?.name ?? "",
      email: cart.contact?.email ?? "",
      phone: cart.contact?.phone ?? "",
      method: cart.shipping?.method ?? "pickup",
      address: cart.shipping?.address ?? "",
      notes: "",
    },
  });

  const method = form.watch("method");
  const requiresAddress = method === "delivery";

  const onSubmit = form.handleSubmit(async (values) => {
    if (!provider) return;
    if (cart.items.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    if (values.method === "delivery" && !values.address) {
      setError("Please provide a delivery address.");
      return;
    }

    track({ type: "begin_checkout" });
    setSubmitting(true);
    setError(null);
    try {
      setContact({ name: values.name, email: values.email, phone: values.phone || undefined });
      setShipping({ method: values.method, address: values.address ?? undefined });

      const orderDraft = {
        items: summary.lines.map((line) => ({
          productId: line.product.id,
          name: line.product.name,
          qty: line.quantity,
          priceCents: line.product.priceCents,
        })),
        subtotalCents: summary.subtotalCents,
        taxCents: summary.taxCents,
        shippingCents: summary.shippingCents,
        totalCents: summary.totalCents,
        customer: {
          name: values.name,
          email: values.email,
          phone: values.phone || undefined,
        },
        shipping: {
          method: values.method,
          address: values.method === "delivery" ? values.address : undefined,
          date: new Date().toISOString(),
        },
      } as const;

      const result = await startCheckout(orderDraft, { demo: true }, provider);
      if (result.ok) {
        clear();
        track({ type: "purchase_demo", payload: { orderId: result.orderId } });
        router.push(result.redirectTo);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="font-brand text-4xl text-brown">Checkout</h1>
        <p className="text-brown/70">Demo checkout marks your order as paid and shows the confirmation screen.</p>
      </header>
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Contact & delivery</CardTitle>
            <CardDescription>All fields are required unless noted otherwise.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...form.register("name")} />
              {form.formState.errors.name ? <p className="text-sm text-red">{form.formState.errors.name.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register("email")} />
              {form.formState.errors.email ? <p className="text-sm text-red">{form.formState.errors.email.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input id="phone" {...form.register("phone")} />
            </div>
            <div className="space-y-2">
              <Label>Delivery method</Label>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant={method === "pickup" ? "primary" : "outline"}
                  onClick={() => form.setValue("method", "pickup")}
                >
                  Pickup (free)
                </Button>
                <Button
                  type="button"
                  variant={method === "delivery" ? "primary" : "outline"}
                  onClick={() => form.setValue("method", "delivery")}
                >
                  Delivery (+$5)
                </Button>
              </div>
            </div>
            {requiresAddress ? (
              <div className="space-y-2">
                <Label htmlFor="address">Delivery address</Label>
                <TextArea id="address" rows={3} {...form.register("address", { required: true })} />
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes for the baker</Label>
              <TextArea id="notes" rows={4} placeholder="Ribbon colors, dietary notes, pickup window" {...form.register("notes")} />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={submitting || cart.items.length === 0}>
              {submitting ? "Processing demo checkout..." : "Complete demo checkout"}
            </Button>
          </CardFooter>
        </Card>

        <Card className="h-max">
          <CardHeader>
            <CardTitle>Order summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-brown/70">
            <div className="space-y-1">
              <p className="flex justify-between"><span>Subtotal</span><span>{summary.formatted.subtotal}</span></p>
              <p className="flex justify-between"><span>Tax</span><span>{summary.formatted.tax}</span></p>
              <p className="flex justify-between"><span>Shipping</span><span>{summary.formatted.shipping}</span></p>
              {summary.discountCents > 0 ? (
                <p className="flex justify-between text-pink"><span>Discount</span><span>-{summary.formatted.discount}</span></p>
              ) : null}
            </div>
            <div className="flex justify-between font-brand text-xl text-brown">
              <span>Total</span>
              <span>{summary.formatted.total}</span>
            </div>
          </CardContent>
          {error ? (
            <p className="px-6 pb-4 text-sm text-red" role="alert">{error}</p>
          ) : null}
        </Card>
      </form>
    </div>
  );
}
