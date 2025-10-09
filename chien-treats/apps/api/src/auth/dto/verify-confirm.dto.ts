import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const verifyConfirmSchema = z.object({
  token: z.string().min(16),
});

export class VerifyConfirmDto extends createZodDto(verifyConfirmSchema) {}
