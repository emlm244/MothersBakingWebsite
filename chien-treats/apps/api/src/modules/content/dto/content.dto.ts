import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const contentUpsertSchema = z.object({
  title: z.string().min(1),
  bodyMd: z.string().min(1),
});

export class ContentUpsertDto extends createZodDto(contentUpsertSchema) {}
