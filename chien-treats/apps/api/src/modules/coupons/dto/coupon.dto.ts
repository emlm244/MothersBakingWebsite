import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const couponSchema = z.object({
  code: z.string().toUpperCase().trim().min(2).max(32),
  pctOff: z.number().int().min(1).max(100).optional(),
  amountOffCents: z.number().int().min(1).optional(),
  active: z.boolean().default(true),
}).superRefine((value, ctx) => {
  if (!value.pctOff && !value.amountOffCents) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["pctOff"], message: "Provide pctOff or amountOffCents" });
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["amountOffCents"], message: "Provide pctOff or amountOffCents" });
  }
  if (value.pctOff && value.amountOffCents) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Only one discount type allowed" });
  }
});

export class CouponUpsertDto extends createZodDto(couponSchema) {}

export const couponValidateSchema = z.object({
  code: z.string().toUpperCase().trim(),
});

export class CouponValidateDto extends createZodDto(couponValidateSchema) {}
