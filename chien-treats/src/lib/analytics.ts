"use client";

type AnalyticsEvent =
  | { type: "view_product"; payload: { productId: string } }
  | { type: "add_to_cart"; payload: { productId: string; qty: number } }
  | { type: "begin_checkout" }
  | { type: "purchase_demo"; payload: { orderId: string } }
  | { type: "submit_review"; payload: { productId: string; rating: number } }
  | { type: "create_ticket"; payload: { ticketId: string } };

export function useAnalytics() {
  function track(event: AnalyticsEvent) {
    if (process.env.NODE_ENV !== "production") {
      const payload = "payload" in event ? event.payload : {};
      console.info(`[analytics] ${event.type}`, payload);
    }
    // TODO: wire to GA4 or a privacy-friendly alternative
  }

  return { track };
}
