import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import type { AuthUser } from "../../auth/auth.types";
import type { Product as ProductResponse, Ticket as TicketResponse } from "@data";
import { TicketPriority, TicketStatus } from "@prisma/client";

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async searchProducts(query: string): Promise<ProductResponse[]> {
    const products = await this.prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { descriptionMd: { contains: query, mode: "insensitive" } },
          { tags: { hasSome: [query.toLowerCase()] } },
        ],
      },
      orderBy: { name: "asc" },
      take: 10,
    });
    return products.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      subtitle: p.subtitle ?? undefined,
      priceCents: p.priceCents,
      flavors: p.flavors ?? [],
      tags: p.tags ?? [],
      isAvailable: p.isAvailable,
      images: p.images ?? [],
      descriptionMd: p.descriptionMd,
      nutrition: (p.nutrition as Record<string, string> | null) ?? undefined,
      allergens: p.allergens ?? [],
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));
  }

  async searchTickets(query: string, user: AuthUser | undefined): Promise<TicketResponse[]> {
    if (!user || !["admin", "staff", "support"].includes(user.role)) {
      return [];
    }
    const tickets = await this.prisma.ticket.findMany({
      where: {
        OR: [
          { number: { contains: query, mode: "insensitive" } },
          { title: { contains: query, mode: "insensitive" } },
          { requesterEmail: { contains: query, mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return tickets.map((ticket) => {
      const attachments = (ticket.attachments as Array<{ name: string; mime: string; storageKey?: string; dataUrl?: string }> | undefined) ?? [];
      return {
        id: ticket.id,
        number: ticket.number,
        title: ticket.title,
        body: ticket.body,
        status: ticket.status as TicketStatus,
        priority: ticket.priority as TicketPriority,
        labels: ticket.labels ?? [],
        requesterEmail: ticket.requesterEmail,
        orderId: ticket.orderId ?? undefined,
        assigneeId: ticket.assigneeId ?? undefined,
        watchers: ticket.watchers ?? [],
        internalNotes: (ticket.internalNotes as any[]) ?? [],
        attachments: attachments.map((attachment) => ({
          name: attachment.name,
          mime: attachment.mime,
          dataUrl: attachment.dataUrl ?? (attachment.storageKey ? `storage:${attachment.storageKey}` : ""),
        })),
        createdAt: ticket.createdAt.toISOString(),
        updatedAt: ticket.updatedAt.toISOString(),
      };
    });
  }
}
