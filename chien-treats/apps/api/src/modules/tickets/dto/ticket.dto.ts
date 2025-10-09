import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { TicketPriority, TicketStatus } from "@prisma/client";

export const ticketCreateSchema = z.object({
  title: z.string().min(3).max(200),
  body: z.string().min(10),
  priority: z.nativeEnum(TicketPriority).default("medium"),
  labels: z.array(z.string()).max(10).optional(),
  orderId: z.string().cuid().optional(),
});

export class TicketCreateDto extends createZodDto(ticketCreateSchema) {}

export const ticketUpdateSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  body: z.string().min(10).optional(),
  status: z.nativeEnum(TicketStatus).optional(),
  priority: z.nativeEnum(TicketPriority).optional(),
  labels: z.array(z.string()).max(10).optional(),
  assigneeId: z.string().cuid().nullable().optional(),
  watchers: z.array(z.string().email()).max(10).optional(),
});

export class TicketUpdateDto extends createZodDto(ticketUpdateSchema) {}

export const ticketNoteSchema = z.object({
  note: z.string().min(2).max(2000),
});

export class TicketNoteDto extends createZodDto(ticketNoteSchema) {}

export const ticketQuerySchema = z.object({
  status: z.nativeEnum(TicketStatus).optional(),
  priority: z.nativeEnum(TicketPriority).optional(),
  labels: z.array(z.string()).optional(),
  assigneeId: z.string().cuid().optional(),
  search: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export class TicketQueryDto extends createZodDto(ticketQuerySchema.partial()) {}
