import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { MailerService } from "../../mailer/mailer.service";
import type { Order as OrderResponse, OrderItem } from "@data";
import { Order as OrderModel, Prisma } from "@prisma/client";
import { OrderCreateDto, OrderUpdateDto } from "./dto/order.dto";
import type { AuthUser } from "../../auth/auth.types";
import { EventsService } from "../../events/events.service";
import dayjs from "dayjs";
import { CouponsService } from "../coupons/coupons.service";

type PaymentStatus = OrderResponse["payment"]["status"];

const DELIVERY_FEE_CENTS = 500;
const TAX_RATE = 0.0825;

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventsService,
    private readonly coupons: CouponsService,
    private readonly mailer: MailerService,
  ) {}

  async list(params: { skip?: number; take?: number }) {
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.order.count(),
      this.prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        skip: params.skip,
        take: params.take,
      }),
    ]);

    return {
      total,
      items: rows.map((order) => this.toResponse(order)),
    };
  }

  async get(id: string, requester?: AuthUser | null) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException("Order not found");
    }

    if (!this.canRead(order, requester)) {
      throw new ForbiddenException("You do not have access to this order");
    }

    return this.toResponse(order);
  }

  async create(dto: OrderCreateDto, user?: AuthUser) {
    const totals = await this.prepareTotals(dto.items, dto.shipping?.method, dto.couponCode);
    const paymentStatus: PaymentStatus = dto.demo ? "demo-paid" : "unpaid";

    const created = await this.prisma.order.create({
      data: {
        number: this.generateOrderNumber(),
        items: totals.items as unknown as Prisma.InputJsonValue,
        subtotalCents: totals.subtotalCents,
        taxCents: totals.taxCents,
        shippingCents: totals.shippingCents,
        totalCents: totals.totalCents,
        customer: dto.customer as unknown as Prisma.InputJsonValue,
        shipping: (dto.shipping ?? null) as unknown as Prisma.InputJsonValue,
        payment: {
          status: paymentStatus,
          provider: dto.demo ? ("stripe" as const) : undefined,
        } as unknown as Prisma.InputJsonValue,
        customerId: user?.id ?? null,
        couponCode: dto.couponCode ?? null,
      },
    });

    const response = this.toResponse(created);
    if (paymentStatus === "demo-paid") {
      this.events.emit("orders", "order:paid", response);
    } else {
      this.events.emit("orders", "order:created", response);
    }

    await this.mailer.sendOrderConfirmation({
      to: dto.customer.email,
      customerName: dto.customer.name,
      orderNumber: response.number,
    });

    return response;
  }

  async update(id: string, dto: OrderUpdateDto) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException("Order not found");
    }

    const storedItems = (order.items as unknown as OrderItem[]) ?? [];
    const itemsInput = storedItems.map((item) => ({ productId: item.productId, qty: item.qty }));
    const shippingMethod = dto.shipping?.method ?? (order.shipping as any)?.method;
    const couponCode = dto.couponCode ?? order.couponCode ?? undefined;
    const totals = await this.prepareTotals(itemsInput, shippingMethod, couponCode);

    const currentPayment = order.payment as { status: PaymentStatus; provider?: string };
    const newPayment: { status: PaymentStatus; provider?: string } = dto.paymentStatus
      ? { ...currentPayment, status: dto.paymentStatus }
      : currentPayment;

    const updated = await this.prisma.order.update({
      where: { id },
      data: {
        shipping: (dto.shipping ?? (order.shipping as unknown)) as Prisma.InputJsonValue,
        couponCode: couponCode ?? null,
        payment: newPayment as unknown as Prisma.InputJsonValue,
        subtotalCents: totals.subtotalCents,
        taxCents: totals.taxCents,
        shippingCents: totals.shippingCents,
        totalCents: totals.totalCents,
      },
    });

    const response = this.toResponse(updated);
    this.emitPaymentEvent(currentPayment.status, newPayment.status, response);
    return response;
  }

  async markDemoPaid(id: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException("Order not found");
    }

    const payment = order.payment as { status: PaymentStatus; provider?: string };
    if (payment.status === "demo-paid") {
      return this.toResponse(order);
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: {
        payment: {
          status: "demo-paid",
          provider: "stripe" as const,
        } as unknown as Prisma.InputJsonValue,
      },
    });

    const response = this.toResponse(updated);
    this.events.emit("orders", "order:paid", response);
    return response;
  }

  private async prepareTotals(
    itemsInput: Array<{ productId: string; qty: number }>,
    shippingMethod?: "pickup" | "delivery",
    couponCode?: string,
  ) {
    const productIds = [...new Set(itemsInput.map((item) => item.productId))];
    const products = await this.prisma.product.findMany({ where: { id: { in: productIds } } });
    if (products.length !== productIds.length) {
      throw new BadRequestException("One or more products are invalid");
    }

    const productMap = new Map(products.map((product) => [product.id, product]));

    const items: OrderItem[] = itemsInput.map((item) => {
      const product = productMap.get(item.productId)!;
      return {
        productId: product.id,
        name: product.name,
        qty: item.qty,
        priceCents: product.priceCents,
      };
    });

    const subtotalCents = items.reduce((total, item) => total + item.priceCents * item.qty, 0);
    const taxCents = Math.round(subtotalCents * TAX_RATE);
    const shippingCents = shippingMethod === "delivery" ? DELIVERY_FEE_CENTS : 0;

    let discountCents = 0;
    if (couponCode) {
      const validation = await this.coupons.validate(couponCode);
      if (!validation.valid) {
        throw new BadRequestException("Invalid coupon code");
      }
      if (validation.pctOff) {
        discountCents = Math.floor((subtotalCents * validation.pctOff) / 100);
      } else if (validation.amountOffCents) {
        discountCents = validation.amountOffCents;
      }
      const maxDiscount = subtotalCents + taxCents + shippingCents;
      discountCents = Math.min(discountCents, maxDiscount);
    }

    const totalCents = subtotalCents + taxCents + shippingCents - discountCents;

    return {
      items,
      subtotalCents,
      taxCents,
      shippingCents,
      discountCents,
      totalCents,
    };
  }

  private emitPaymentEvent(previous: PaymentStatus, next: PaymentStatus, order: OrderResponse) {
    if (previous === next) {
      return;
    }
    if (next === "paid" || next === "demo-paid") {
      this.events.emit("orders", "order:paid", order);
    } else if (next === "refunded") {
      this.events.emit("orders", "order:refunded", order);
    } else {
      this.events.emit("orders", "order:updated", order);
    }
  }

  private canRead(order: OrderModel, user?: AuthUser | null) {
    if (!user) {
      return false;
    }
    if (["admin", "staff", "support"].includes(user.role)) {
      return true;
    }
    if (order.customerId && order.customerId === user.id) {
      return true;
    }
    const customer = order.customer as { email?: string };
    return customer?.email?.toLowerCase() === user.email.toLowerCase();
  }

  private toResponse(order: OrderModel): OrderResponse {
    const items = (order.items as unknown as OrderItem[]) ?? [];
    const customer = order.customer as OrderResponse["customer"];
    const shipping = (order.shipping as unknown as OrderResponse["shipping"]) ?? undefined;
    const payment = order.payment as { status: PaymentStatus; provider?: string };

    return {
      id: order.id,
      number: order.number,
      items,
      subtotalCents: order.subtotalCents,
      taxCents: order.taxCents,
      shippingCents: order.shippingCents,
      totalCents: order.totalCents,
      customer,
      shipping,
      payment: {
        status: payment.status,
        provider: payment.provider === "stripe" ? "stripe" : undefined,
      },
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  }

  private generateOrderNumber() {
    return `ORD-${dayjs().format("YYYYMMDDHHmmss")}`;
  }
}
