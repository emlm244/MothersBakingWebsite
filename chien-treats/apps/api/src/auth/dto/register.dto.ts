import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { Role } from "@prisma/client";

export const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(10),
  role: z.nativeEnum(Role).optional(),
});

export class RegisterDto extends createZodDto(registerSchema) {}