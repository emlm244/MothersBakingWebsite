import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const orderItemSchema = z.object({
  productId: z.string().cuid(),
  qty: z.number().int().positive().max(99),
});

const customerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(7).max(20).optional(),
});

const shippingSchema = z.object({
  method: z.enum(["pickup", "delivery"]),
  address: z.string().min(5).max(500).optional(),
  date: z.string().datetime().optional(),
});

const paymentStatusSchema = z.enum(["unpaid", "paid", "refunded", "demo-paid"]);

export const orderCreateSchema = z.object({
  items: z.array(orderItemSchema).min(1),
  customer: customerSchema,
  shipping: shippingSchema.optional(),
  couponCode: z.string().min(2).max(32).optional(),
  demo: z.boolean().optional(),
});

export class OrderCreateDto extends createZodDto(orderCreateSchema) {}

export const orderUpdateSchema = z.object({
  shipping: shippingSchema.optional(),
  paymentStatus: paymentStatusSchema.optional(),
  couponCode: z.string().min(2).max(32).optional(),
});

export class OrderUpdateDto extends createZodDto(orderUpdateSchema) {}

export const demoPaySchema = z.object({
  provider: z.string().default("demo"),
});

export class DemoPayDto extends createZodDto(demoPaySchema) {}
