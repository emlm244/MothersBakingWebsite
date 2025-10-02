import type { DataProvider, Order } from "@data";

type DraftOrder = Omit<Order, "id" | "number" | "payment" | "createdAt" | "updatedAt">;

type CheckoutOptions = {
  demo?: boolean;
};

export async function startCheckout(orderDraft: DraftOrder, opts: CheckoutOptions, data: DataProvider) {
  if (opts.demo) {
    const order = await data.createOrder(
      {
        ...orderDraft,
        payment: { status: "demo-paid", provider: "stripe" },
      },
      { demoPaid: true },
    );
    return { ok: true as const, orderId: order.id, redirectTo: `/order/${order.id}` };
  }
  throw new Error("Stripe not configured. Enable demo checkout or add backend per /docs/INTEGRATIONS.md");
}
