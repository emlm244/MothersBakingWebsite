import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { ReviewStatus } from "@prisma/client";

export const reviewCreateSchema = z.object({
  productId: z.string().cuid(),
  userName: z.string().min(1).max(120),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(200).optional(),
  body: z.string().min(10).max(2000),
});

export class ReviewCreateDto extends createZodDto(reviewCreateSchema) {}

export const reviewStatusSchema = z.object({
  status: z.nativeEnum(ReviewStatus),
  rejectionReason: z.string().max(500).optional().nullable(),
});

export class ReviewStatusDto extends createZodDto(reviewStatusSchema) {}
