import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const moneySchema = z.number().int().nonnegative();

export const productBodySchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  subtitle: z.string().optional().nullable(),
  priceCents: moneySchema,
  flavors: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  isAvailable: z.boolean().default(true),
  images: z.array(z.string()).default([]),
  descriptionMd: z.string().min(1),
  nutrition: z.record(z.string(), z.string()).optional().nullable(),
  allergens: z.array(z.string()).default([]),
});

export class ProductCreateDto extends createZodDto(productBodySchema) {}

export const productUpdateSchema = productBodySchema.partial();

export class ProductUpdateDto extends createZodDto(productUpdateSchema) {}
