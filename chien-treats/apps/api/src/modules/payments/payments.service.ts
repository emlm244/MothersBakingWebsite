import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../prisma/prisma.service";
import { ProblemException, problemTypes } from "../../common/errors/problem-details";
import type Stripe from "stripe";
import { Prisma } from "@prisma/client";

@Injectable()
export class PaymentsService {
  private stripe: Stripe | null;

  constructor(private readonly config: ConfigService, private readonly prisma: PrismaService) {
    const secret = this.config.get<string>("app.stripe.secretKey");
    if (secret) {
      // Lazy require to avoid bundle issues if not installed
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const StripeCtor = require("stripe");
      this.stripe = new StripeCtor(secret, { apiVersion: "2023-10-16" });
    } else {
      this.stripe = null;
    }
  }

  isConfigured() {
    return Boolean(this.stripe);
  }

  async createCheckoutSession(orderId: string) {
    if (!this.stripe) {
      throw new ProblemException({
        type: problemTypes.notImplemented,
        title: "Stripe not configured",
        status: 501,
        detail: "Provide STRIPE_SECRET_KEY to enable checkout.",
      });
    }

    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new ProblemException({
        type: problemTypes.notFound,
        title: "Order not found",
        status: 404,
      });
    }

    const lineItems = ((order.items as unknown as Array<{ name: string; qty: number; priceCents: number }>) ?? []).map((item) => ({
      price_data: {
        currency: "usd",
        product_data: { name: item.name },
        unit_amount: item.priceCents,
      },
      quantity: item.qty,
    }));

    const session = await this.stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${this.config.get("app.baseUrl")}/checkout/success?order=${order.id}`,
      cancel_url: `${this.config.get("app.baseUrl")}/checkout/cancel?order=${order.id}`,
      metadata: { orderId: order.id },
    });

    return { url: session.url };
  }

  async handleStripeWebhook(rawBody: Buffer, signature: string | undefined) {
    if (!this.stripe) {
      throw new ProblemException({
        type: problemTypes.notImplemented,
        title: "Stripe not configured",
        status: 501,
        detail: "Provide STRIPE_SECRET_KEY to enable webhook handling.",
      });
    }

    const webhookSecret = this.config.get<string>("app.stripe.webhookSecret");
    if (!webhookSecret) {
      throw new ProblemException({
        type: problemTypes.notImplemented,
        title: "Stripe webhook secret not configured",
        status: 501,
      });
    }

    if (!signature) {
      throw new ProblemException({
        type: problemTypes.validation,
        title: "Missing stripe signature",
        status: 400,
      });
    }

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (error) {
      throw new ProblemException({
        type: problemTypes.validation,
        title: "Invalid stripe signature",
        status: 400,
        detail: (error as Error).message,
      });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;
      if (orderId) {
        await this.prisma.order.update({
          where: { id: orderId },
          data: {
            payment: { status: "paid", provider: "stripe" } as unknown as Prisma.InputJsonValue,
          },
        });
      }
    }

    return { received: true };
  }
}
