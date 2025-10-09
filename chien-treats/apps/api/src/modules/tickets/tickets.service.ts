import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import type { Ticket as TicketResponse } from "@data";
import { Prisma, TicketPriority, TicketStatus, Ticket as TicketModel } from "@prisma/client";
import { TicketCreateDto, TicketUpdateDto, TicketNoteDto } from "./dto/ticket.dto";
import type { AuthUser } from "../../auth/auth.types";
import { sanitizeMarkdown, sanitizePlain } from "../../common/utils/sanitize";
import { EventsService } from "../../events/events.service";
import { StorageService } from "../../storage/storage.service";
import { randomBytes } from "crypto";
import * as argon2 from "argon2";
import { MailerService } from "../../mailer/mailer.service";
import { TicketNotificationsService } from "./ticket-notifications.service";
import { parse } from "csv-parse";
import { stringify } from "csv-stringify";
import { Readable } from "stream";
import dayjs from "dayjs";

interface TicketFilters {
  status?: TicketStatus;
  priority?: TicketPriority;
  labels?: string[];
  assigneeId?: string;
  search?: string;
  skip?: number;
  take?: number;
}

@Injectable()
export class TicketsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventsService,
    private readonly storage: StorageService,
    private readonly mailer: MailerService,
    private readonly notifications: TicketNotificationsService,
  ) {}

  async list(filters: TicketFilters) {
    const where: Prisma.TicketWhereInput = {};
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.labels?.length) where.labels = { hasSome: filters.labels };
    if (filters.assigneeId) where.assigneeId = filters.assigneeId;
    if (filters.search) {
      const term = filters.search.trim();
      where.OR = [
        { title: { contains: term, mode: "insensitive" } },
        { body: { contains: term, mode: "insensitive" } },
        { requesterEmail: { contains: term, mode: "insensitive" } },
      ];
    }

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.ticket.count({ where }),
      this.prisma.ticket.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: filters.skip,
        take: filters.take,
      }),
    ]);

    return {
      total,
      items: rows.map((ticket) => this.toResponse(ticket)),
    };
  }

  async get(id: string, accessCode: string | undefined, user: AuthUser | undefined) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id } });
    if (!ticket) {
      throw new NotFoundException("Ticket not found");
    }

    if (!(await this.canRead(ticket, user, accessCode))) {
      throw new ForbiddenException("You do not have access to this ticket");
    }

    return this.toResponse(ticket);
  }

  async create(dto: TicketCreateDto, user: AuthUser) {
    if (!user.emailVerifiedAt) {
      throw new ForbiddenException("Verify your email to open a support ticket.");
    }

    const accessCode = randomBytes(16).toString("hex");
    const hash = await argon2.hash(accessCode);

    const ticket = await this.prisma.ticket.create({
      data: {
        number: this.generateTicketNumber(),
        title: sanitizePlain(dto.title),
        body: sanitizeMarkdown(dto.body),
        status: "open",
        priority: dto.priority ?? "medium",
        labels: dto.labels ?? [],
        requesterEmail: user.email,
        requesterId: user.id,
        orderId: dto.orderId ?? null,
        internalNotes: [] as Prisma.InputJsonValue,
        attachments: [] as Prisma.InputJsonValue,
        accessCodeHash: hash,
      },
    });

    const response = this.toResponse(ticket);
    this.events.emit("tickets", "ticket:created", response);

    await this.mailer.sendTicketCreated({ to: user.email, title: response.title, number: response.number });

    return { ticket: response, accessCode };
  }

  async update(id: string, dto: TicketUpdateDto, user: AuthUser) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id } });
    if (!ticket) {
      throw new NotFoundException("Ticket not found");
    }

    const data: Prisma.TicketUncheckedUpdateInput = {};
    if (dto.title) data.title = sanitizePlain(dto.title);
    if (dto.body) data.body = sanitizeMarkdown(dto.body);
    if (dto.status) data.status = dto.status;
    if (dto.priority) data.priority = dto.priority;
    if (dto.labels) data.labels = dto.labels;
    if (dto.assigneeId !== undefined) data.assigneeId = dto.assigneeId;
    if (dto.watchers) data.watchers = dto.watchers;

    const updated = await this.prisma.ticket.update({ where: { id }, data });

    const response = this.toResponse(updated);
    this.events.emit("tickets", "ticket:updated", response);
    await this.notifications.enqueueTicketUpdate(response);
    return response;
  }

  async addNote(id: string, dto: TicketNoteDto, user: AuthUser) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id } });
    if (!ticket) {
      throw new NotFoundException("Ticket not found");
    }

    const notes = (ticket.internalNotes as Array<{ by: string; at: string; note: string }> | undefined) ?? [];
    notes.push({ by: user.id, at: new Date().toISOString(), note: sanitizeMarkdown(dto.note) });

    const updated = await this.prisma.ticket.update({
      where: { id },
      data: { internalNotes: notes as unknown as Prisma.InputJsonValue },
    });

    const response = this.toResponse(updated);
    this.events.emit("tickets", "ticket:updated", response);
    await this.notifications.enqueueTicketUpdate(response);
    return response;
  }

  async addAttachment(id: string, file: { buffer: Buffer; mimetype: string; originalname: string }, user: AuthUser) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id } });
    if (!ticket) {
      throw new NotFoundException("Ticket not found");
    }

    if (!(await this.canRead(ticket, user))) {
      throw new ForbiddenException("You do not have access to this ticket");
    }

    const stored = await this.storage.save(file.buffer, {
      contentType: file.mimetype,
      filename: file.originalname,
    });

    const attachments = (ticket.attachments as Array<{ name: string; mime: string; storageKey: string }> | undefined) ?? [];
    attachments.push({ name: stored.name, mime: stored.mime, storageKey: stored.key });

    const updated = await this.prisma.ticket.update({
      where: { id },
      data: { attachments: attachments as unknown as Prisma.InputJsonValue },
    });

    const response = this.toResponse(updated);
    this.events.emit("tickets", "ticket:updated", response);
    return response;
  }

  async exportCsv() {
    const tickets = await this.prisma.ticket.findMany({ orderBy: { createdAt: "desc" } });
    const rows = tickets.map((ticket) => ({
      id: ticket.id,
      number: ticket.number,
      title: ticket.title,
      status: ticket.status,
      priority: ticket.priority,
      labels: (ticket.labels ?? []).join("|"),
      requesterEmail: ticket.requesterEmail,
      assigneeId: ticket.assigneeId ?? "",
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
    }));

    return new Promise<string>((resolve, reject) => {
      stringify(rows, { header: true }, (err, output) => {
        if (err) reject(err);
        else resolve(output);
      });
    });
  }

  async importCsv(buffer: Buffer, actor: AuthUser) {
    const parser = parse({ columns: true, trim: true });
    const stream = Readable.from(buffer);
    const records: any[] = [];

    return new Promise<{ imported: number }>((resolve, reject) => {
      stream
        .pipe(parser)
        .on("data", (row) => records.push(row))
        .on("error", reject)
        .on("end", async () => {
          try {
            for (const row of records) {
              const existing = await this.prisma.ticket.findUnique({ where: { id: row.id } });
              const payload: Prisma.TicketUpsertArgs["create"] = {
                id: row.id || undefined,
                number: row.number || this.generateTicketNumber(),
                title: sanitizePlain(row.title || "Untitled"),
                body: sanitizeMarkdown(row.body || "Imported"),
                status: this.parseStatus(row.status),
                priority: this.parsePriority(row.priority),
                labels: row.labels ? String(row.labels).split("|").filter(Boolean) : [],
                requesterEmail: row.requesterEmail ?? actor.email,
                assigneeId: row.assigneeId || null,
                internalNotes: [] as Prisma.InputJsonValue,
                attachments: [] as Prisma.InputJsonValue,
                accessCodeHash: existing?.accessCodeHash ?? (await argon2.hash(randomBytes(16).toString("hex"))),
              };

              await this.prisma.ticket.upsert({
                where: { id: row.id ?? "" },
                create: payload,
                update: {
                  title: payload.title,
                  status: payload.status,
                  priority: payload.priority,
                  labels: payload.labels,
                  requesterEmail: payload.requesterEmail,
                  assigneeId: payload.assigneeId,
                },
              });
            }
            resolve({ imported: records.length });
          } catch (error) {
            reject(error);
          }
        });
    });
  }

  private async canRead(ticket: TicketModel, user?: AuthUser | null, token?: string) {
    if (user && ["admin", "staff", "support"].includes(user.role)) {
      return true;
    }
    if (user && ticket.requesterId && ticket.requesterId === user.id) {
      return true;
    }
    if (user && ticket.requesterEmail.toLowerCase() === user.email.toLowerCase()) {
      return true;
    }
    if (token && ticket.accessCodeHash) {
      const matches = await argon2.verify(ticket.accessCodeHash, token).catch(() => false);
      if (matches) {
        return true;
      }
    }
    return false;
  }

  private parseStatus(input: string): TicketStatus {
    if (Object.values(TicketStatus).includes(input as TicketStatus)) {
      return input as TicketStatus;
    }
    return TicketStatus.open;
  }

  private parsePriority(input: string): TicketPriority {
    if (Object.values(TicketPriority).includes(input as TicketPriority)) {
      return input as TicketPriority;
    }
    return TicketPriority.medium;
  }

  private toResponse(ticket: TicketModel): TicketResponse {
    const attachmentsMeta = (ticket.attachments as Array<{ name: string; mime: string; storageKey: string }> | undefined) ?? [];
    return {
      id: ticket.id,
      number: ticket.number,
      title: ticket.title,
      body: ticket.body,
      status: ticket.status,
      priority: ticket.priority,
      labels: ticket.labels ?? [],
      requesterEmail: ticket.requesterEmail,
      requesterId: ticket.requesterId ?? undefined,
      orderId: ticket.orderId ?? undefined,
      assigneeId: ticket.assigneeId ?? undefined,
      watchers: ticket.watchers ?? [],
      internalNotes: (ticket.internalNotes as Array<{ by: string; at: string; note: string }> | undefined) ?? [],
      attachments: attachmentsMeta.map((attachment) => ({
        name: attachment.name,
        mime: attachment.mime,
        dataUrl: `storage:${attachment.storageKey}`,
      })),
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
    };
  }

  private generateTicketNumber() {
    return `TIC-${dayjs().format("YYYYMMDDHHmmss")}`;
  }
}
