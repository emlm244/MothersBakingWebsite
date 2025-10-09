import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as argon2 from "argon2";
import { TicketsService } from "./tickets.service";

vi.mock("@prisma/client", () => ({
  TicketStatus: {
    open: "open",
    in_progress: "in_progress",
    waiting: "waiting",
    closed: "closed",
  },
  TicketPriority: {
    low: "low",
    medium: "medium",
    high: "high",
    urgent: "urgent",
  },
}));

const baseTicket = async () => ({
  id: "tick_123",
  number: "TIC-202501010101",
  title: "Help with macarons",
  body: "I need to adjust my pickup",
  status: "open" as const,
  priority: "medium" as const,
  labels: ["contact"],
  requesterEmail: "guest@example.com",
  requesterId: "user_123",
  accessCodeHash: await argon2.hash("secret-code"),
  orderId: null,
  assigneeId: null,
  watchers: [] as string[],
  internalNotes: [] as unknown,
  attachments: [] as unknown,
  createdAt: new Date("2025-01-01T00:00:00Z"),
  updatedAt: new Date("2025-01-01T00:00:00Z"),
});

describe("TicketsService", () => {
  let prisma: any;
  let service: TicketsService;
  let mailer: { sendTicketCreated: ReturnType<typeof vi.fn>; sendTicketUpdated: ReturnType<typeof vi.fn> };
  let notifications: { enqueueTicketUpdate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    prisma = {
      ticket: {
        findUnique: vi.fn(),
        update: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
      },
      $transaction: vi.fn(),
    };

    const events = { emit: vi.fn() };
    const storage = { save: vi.fn(), remove: vi.fn() };
    mailer = { sendTicketCreated: vi.fn(), sendTicketUpdated: vi.fn() };
    notifications = { enqueueTicketUpdate: vi.fn() };

    prisma.ticket.create.mockImplementation(async ({ data }: { data: any }) => ({
      ...(await baseTicket()),
      ...data,
      requesterEmail: data.requesterEmail ?? "guest@example.com",
      requesterId: data.requesterId ?? "user_123",
    }));

    service = new TicketsService(prisma, events as any, storage as any, mailer as any, notifications as any);

    prisma.ticket.findUnique.mockResolvedValue(await baseTicket());
  });

  it("returns a ticket when access code matches", async () => {
    const ticket = await service.get("tick_123", "secret-code", undefined);
    expect(ticket.id).toBe("tick_123");
    expect(ticket.requesterEmail).toBe("guest@example.com");
  });

  it("throws ForbiddenException when code is invalid", async () => {
    await expect(service.get("tick_123", "wrong-code", undefined)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("throws NotFoundException when ticket missing", async () => {
    prisma.ticket.findUnique.mockResolvedValueOnce(null);
    await expect(service.get("missing", "secret-code", undefined)).rejects.toBeInstanceOf(NotFoundException);
  });

  it("prevents unverified users from creating tickets", async () => {
    await expect(
      service.create(
        {
          title: "Need help",
          body: "Please assist with my order status.",
          priority: "medium",
          status: "open",
        } as any,
        {
          id: "user-unverified",
          email: "user@example.com",
          name: "Demo User",
          role: "customer",
          emailVerifiedAt: null,
        },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("creates a ticket for verified users and notifies via email", async () => {
    const result = await service.create(
      {
        title: "Order issue",
        body: "I have a question about my recent pickup.",
        priority: "medium",
        status: "open",
      } as any,
      {
        id: "user_123",
        email: "verified@example.com",
        name: "Helpful Human",
        role: "customer",
        emailVerifiedAt: new Date().toISOString(),
      },
    );

    expect(result.ticket.requesterEmail).toBe("verified@example.com");
    expect(mailer.sendTicketCreated).toHaveBeenCalledWith(
      expect.objectContaining({ to: "verified@example.com", number: result.ticket.number }),
    );
  });
});
