import { describe, expect, it, vi } from "vitest";
import { createRestProvider } from "./rest-provider";

describe("RestProvider", () => {
  it("validates coupons through the API", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ valid: true, pctOff: 10 }),
    });

    const provider = createRestProvider("https://api.example.com", fetchMock as any);
    const result = await provider.validateCoupon!("WELCOME10");

    expect(fetchMock).toHaveBeenCalledWith("https://api.example.com/coupons/validate", expect.objectContaining({
      method: "POST",
    }));
    expect(result).toEqual({ valid: true, pctOff: 10 });
  });

  it("sends lean payloads for createOrder", async () => {
    const orderResponse = {
      order: {
        id: "ord_1",
        number: "ORD-123",
        items: [],
        subtotalCents: 1000,
        taxCents: 80,
        shippingCents: 0,
        totalCents: 1080,
        customer: { name: "Linh", email: "linh@example.com" },
        shipping: { method: "pickup" },
        payment: { status: "demo-paid" },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(orderResponse),
    });

    const provider = createRestProvider("https://api.example.com", fetchMock as any);
    await provider.createOrder(
      {
        items: [
          {
            productId: "prod_1",
            name: "Honey Lavender",
            qty: 2,
            priceCents: 320,
          },
        ],
        subtotalCents: 640,
        taxCents: 51,
        shippingCents: 0,
        totalCents: 691,
        customer: { name: "Linh", email: "linh@example.com" },
        shipping: { method: "pickup" },
      },
      { demoPaid: true },
    );

    const [, requestInit] = fetchMock.mock.calls.at(-1)!;
    const parsedBody = JSON.parse(requestInit!.body as string);

    expect(parsedBody.items).toEqual([{ productId: "prod_1", qty: 2 }]);
    expect(parsedBody.demo).toBe(true);
  });

  it("sends minimal fields when creating a ticket", async () => {
    const ticketResponse = {
      ticket: {
        id: "tic_1",
        number: "TIC-123",
        title: "Need assistance",
        body: "Can you help me with my order?",
        status: "open",
        priority: "medium",
        labels: ["support"],
        requesterEmail: "user@example.com",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      accessCode: "secret",
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(ticketResponse),
    });

    const provider = createRestProvider("https://api.example.com", fetchMock as any);
    await provider.createTicket({
      title: "Need assistance",
      body: "Can you help me with my order?",
      priority: "medium",
      status: "open",
      labels: ["support"],
      watchers: [],
      internalNotes: [],
      attachments: [],
    });

    const [, requestInit] = fetchMock.mock.calls.at(-1)!;
    const parsedBody = JSON.parse(requestInit!.body as string);

    expect(parsedBody).toEqual({
      title: "Need assistance",
      body: "Can you help me with my order?",
      priority: "medium",
      labels: ["support"],
    });
  });
});
