import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const verifyRequestSchema = z.object({
  email: z.string().email(),
});

export class VerifyRequestDto extends createZodDto(verifyRequestSchema) {}
