import type {
  ContentBlock,
  Coupon,
  GalleryItem,
  NewsletterSignup,
  Order,
  Product,
  Review,
  Ticket,
  ID,
} from "./models";
import type { DataProvider, ListTicketsParams, CouponValidationResult, TicketCreateInput } from "./provider";
import { buildSeedData } from "./seed";
import { createId, nowIso } from "./utils";

function toMap<T extends { id: ID }>(items: T[]) {
  return new Map<ID, T>(items.map((item) => [item.id, item]));
}

export class InMemoryProvider implements DataProvider {
  private products = new Map<ID, Product>();
  private reviews = new Map<ID, Review>();
  private orders = new Map<ID, Order>();
  private coupons = new Map<string, Coupon>();
  private tickets = new Map<ID, Ticket>();
  private ticketAccessCodes = new Map<ID, string>();
  private contentBlocks = new Map<ID, ContentBlock>();
  private galleryItems = new Map<ID, GalleryItem>();
  private newsletter = new Map<ID, NewsletterSignup>();

  constructor(seed = true) {
    if (seed) {
      this.seed();
    }
  }

  async ready(): Promise<void> {
    return Promise.resolve();
  }

  async reset(): Promise<void> {
    this.products.clear();
    this.reviews.clear();
    this.orders.clear();
    this.coupons.clear();
    this.tickets.clear();
    this.contentBlocks.clear();
    this.galleryItems.clear();
    this.newsletter.clear();
  }

  async listProducts(): Promise<Product[]> {
    return [...this.products.values()].sort((a, b) => a.name.localeCompare(b.name));
  }

  async getProduct(idOrSlug: string): Promise<Product | null> {
    const byId = this.products.get(idOrSlug);
    if (byId) return byId;
    return [...this.products.values()].find((product) => product.slug === idOrSlug) ?? null;
  }

  async upsertProduct(product: Product): Promise<void> {
    this.products.set(product.id, { ...product, updatedAt: nowIso() });
  }

  async deleteProduct(id: ID): Promise<void> {
    this.products.delete(id);
  }

  async listReviews(productId: ID, status?: Review["status"]): Promise<Review[]> {
    return [...this.reviews.values()]
      .filter((review) => review.productId === productId && (!status || review.status === status))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async submitReview(review: Review): Promise<Review> {
    const now = nowIso();
    const stored = { ...review, createdAt: now, updatedAt: now };
    this.reviews.set(stored.id, stored);
    return stored;
  }

  async setReviewStatus(reviewId: ID, status: Review["status"], rejectionReason?: string): Promise<void> {
    const current = this.reviews.get(reviewId);
    if (!current) return;
    this.reviews.set(reviewId, { ...current, status, rejectionReason, updatedAt: nowIso() });
  }

  async createOrder(
    orderDraft: Omit<Order, "id" | "number" | "payment" | "createdAt" | "updatedAt">,
    options?: { demoPaid?: boolean },
  ): Promise<Order> {
    const now = nowIso();
    const order: Order = {
      ...orderDraft,
      id: createId("order"),
      number: `ORD-${Date.now().toString().slice(-5)}`,
      payment: {
        status: options?.demoPaid ? "demo-paid" : "unpaid",
        provider: options?.demoPaid ? "stripe" : undefined,
      },
      createdAt: now,
      updatedAt: now,
    };
    this.orders.set(order.id, order);
    return order;
  }

  async updateOrder(order: Order): Promise<void> {
    this.orders.set(order.id, { ...order, updatedAt: nowIso() });
  }

  async listOrders(): Promise<Order[]> {
    return [...this.orders.values()].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getOrder(id: ID): Promise<Order | null> {
    return this.orders.get(id) ?? null;
  }

  async listCoupons(): Promise<Coupon[]> {
    return [...this.coupons.values()];
  }

  async validateCoupon(code: string): Promise<CouponValidationResult> {
    const coupon = this.coupons.get(code.toUpperCase());
    if (!coupon || !coupon.active) {
      return { valid: false };
    }
    return {
      valid: true,
      pctOff: coupon.pctOff ?? undefined,
      amountOffCents: coupon.amountOffCents ?? undefined,
    };
  }

  async upsertCoupon(coupon: Coupon): Promise<void> {
    this.coupons.set(coupon.code, coupon);
  }

  async deleteCoupon(code: string): Promise<void> {
    this.coupons.delete(code);
  }

  async createTicket(ticketDraft: TicketCreateInput): Promise<{ ticket: Ticket; accessCode: string }> {
    const now = nowIso();
    const ticket: Ticket = {
      id: createId("ticket"),
      number: `TIC-${Math.floor(Math.random() * 9000 + 1000)}`,
      title: ticketDraft.title,
      body: ticketDraft.body,
      status: ticketDraft.status,
      priority: ticketDraft.priority,
      labels: ticketDraft.labels ?? [],
      requesterEmail: ticketDraft.requesterEmail ?? "guest@example.com",
      orderId: ticketDraft.orderId,
      assigneeId: ticketDraft.assigneeId,
      watchers: ticketDraft.watchers ?? [],
      internalNotes: ticketDraft.internalNotes ?? [],
      attachments: ticketDraft.attachments ?? [],
      createdAt: now,
      updatedAt: now,
    };
    this.tickets.set(ticket.id, ticket);
    const accessCode = createId("ticketAccess");
    this.ticketAccessCodes.set(ticket.id, accessCode);
    return { ticket, accessCode };
  }

  async updateTicket(ticket: Ticket): Promise<void> {
    this.tickets.set(ticket.id, { ...ticket, updatedAt: nowIso() });
  }

  async listTickets(params: ListTicketsParams = {}): Promise<{ items: Ticket[]; total: number }> {
    let items = [...this.tickets.values()];
    if (params.status) {
      items = items.filter((ticket) => ticket.status === params.status);
    }
    if (params.labels?.length) {
      items = items.filter((ticket) => params.labels!.every((label) => ticket.labels.includes(label)));
    }
    if (params.requesterEmail) {
      items = items.filter((ticket) => ticket.requesterEmail === params.requesterEmail);
    }
    if (params.search) {
      const search = params.search.toLowerCase();
      items = items.filter(
        (ticket) =>
          ticket.title.toLowerCase().includes(search) ||
          ticket.body.toLowerCase().includes(search) ||
          ticket.requesterEmail.toLowerCase().includes(search),
      );
    }
    items = items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const pageSize = params.pageSize ?? 20;
    const page = params.page ?? 1;
    const start = (page - 1) * pageSize;
    return { items: items.slice(start, start + pageSize), total: items.length };
  }

  async getTicket(id: ID, options?: { accessCode?: string }): Promise<Ticket | null> {
    const ticket = this.tickets.get(id);
    if (!ticket) return null;
    const storedCode = this.ticketAccessCodes.get(id);
    if (storedCode && options?.accessCode && storedCode !== options.accessCode) {
      return null;
    }
    return ticket;
  }

  async listContentBlocks(): Promise<ContentBlock[]> {
    return [...this.contentBlocks.values()];
  }

  async upsertContentBlock(block: ContentBlock): Promise<void> {
    this.contentBlocks.set(block.id, { ...block, updatedAt: nowIso() });
  }

  async listGalleryItems(): Promise<GalleryItem[]> {
    return [...this.galleryItems.values()];
  }

  async upsertGalleryItem(item: GalleryItem): Promise<void> {
    this.galleryItems.set(item.id, { ...item, updatedAt: nowIso() });
  }

  async deleteGalleryItem(id: ID): Promise<void> {
    this.galleryItems.delete(id);
  }

  async listNewsletterSignups(): Promise<NewsletterSignup[]> {
    return [...this.newsletter.values()];
  }

  async addNewsletterSignup(signup: NewsletterSignup): Promise<void> {
    this.newsletter.set(signup.id, signup);
  }

  async seed(): Promise<void> {
    await this.reset();
    const data = buildSeedData();
    this.products = toMap(data.products);
    this.reviews = toMap(data.reviews);
    this.orders = toMap(data.orders);
    this.tickets = toMap(data.tickets);
    this.ticketAccessCodes.clear();
    this.contentBlocks = toMap(data.contentBlocks);
    this.galleryItems = toMap(data.galleryItems);
    this.newsletter = toMap(data.newsletter);
    this.coupons = new Map(data.coupons.map((coupon) => [coupon.code, coupon]));
  }
}

export function createInMemoryProvider(): DataProvider {
  const provider = new InMemoryProvider();
  return provider;
}
