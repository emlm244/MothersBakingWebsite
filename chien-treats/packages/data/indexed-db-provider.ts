import Dexie, { Table } from "dexie";
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

class TreatsDB extends Dexie {
  products!: Table<Product, ID>;
  reviews!: Table<Review, ID>;
  orders!: Table<Order, ID>;
  coupons!: Table<Coupon, string>;
  tickets!: Table<Ticket, ID>;
  contentBlocks!: Table<ContentBlock, ID>;
  galleryItems!: Table<GalleryItem, ID>;
  newsletter!: Table<NewsletterSignup, ID>;

  constructor() {
    super("chiens-treats");
    this.version(1).stores({
      products: "id, slug, name, isAvailable",
      reviews: "id, productId, status",
      orders: "id, number, createdAt",
      coupons: "code",
      tickets: "id, number, status, priority",
      contentBlocks: "id, key",
      galleryItems: "id",
      newsletter: "id, email",
    });
  }
}

const db = new TreatsDB();

async function ensureReady() {
  if (!db.isOpen()) {
    await db.open();
  }
}

function matchesSearch(value: string, search?: string) {
  if (!search) return true;
  return value.toLowerCase().includes(search.toLowerCase());
}

export class IndexedDbProvider implements DataProvider {
  private ticketAccessCodes = new Map<ID, string>();

  async ready(): Promise<void> {
    await ensureReady();
  }

  async reset(): Promise<void> {
    await db.transaction("rw", db.tables, async () => {
      await Promise.all(db.tables.map((table) => table.clear()));
    });
    this.ticketAccessCodes.clear();
  }

  async listProducts(): Promise<Product[]> {
    await ensureReady();
    return (await db.products.toArray()).sort((a, b) => a.name.localeCompare(b.name));
  }

  async getProduct(idOrSlug: string): Promise<Product | null> {
    await ensureReady();
    const byId = await db.products.get(idOrSlug);
    if (byId) return byId;
    const bySlug = await db.products.where("slug").equals(idOrSlug).first();
    return bySlug ?? null;
  }

  async upsertProduct(product: Product): Promise<void> {
    await ensureReady();
    await db.products.put({ ...product, updatedAt: nowIso() });
  }

  async deleteProduct(id: ID): Promise<void> {
    await ensureReady();
    await db.products.delete(id);
  }

  async listReviews(productId: ID, status?: Review["status"]): Promise<Review[]> {
    await ensureReady();
    let collection = db.reviews.where("productId").equals(productId);
    if (status) {
      collection = collection.filter((review) => review.status === status);
    }
    const reviews = await collection.toArray();
    return reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async submitReview(review: Review): Promise<Review> {
    await ensureReady();
    const now = nowIso();
    const stored = { ...review, createdAt: now, updatedAt: now };
    await db.reviews.put(stored);
    return stored;
  }

  async setReviewStatus(reviewId: ID, status: Review["status"], rejectionReason?: string): Promise<void> {
    await ensureReady();
    await db.reviews.update(reviewId, { status, rejectionReason, updatedAt: nowIso() });
  }

  async createOrder(
    orderDraft: Omit<Order, "id" | "number" | "payment" | "createdAt" | "updatedAt">,
    options?: { demoPaid?: boolean },
  ): Promise<Order> {
    await ensureReady();
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
    await db.orders.put(order);
    return order;
  }

  async updateOrder(order: Order): Promise<void> {
    await ensureReady();
    await db.orders.put({ ...order, updatedAt: nowIso() });
  }

  async listOrders(): Promise<Order[]> {
    await ensureReady();
    const orders = await db.orders.toArray();
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getOrder(id: ID): Promise<Order | null> {
    await ensureReady();
    const order = await db.orders.get(id);
    return order ?? null;
  }

  async listCoupons(): Promise<Coupon[]> {
    await ensureReady();
    return db.coupons.toArray();
  }

  async validateCoupon(code: string): Promise<CouponValidationResult> {
    await ensureReady();
    const coupon = await db.coupons.get(code.toUpperCase());
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
    await ensureReady();
    await db.coupons.put(coupon);
  }

  async deleteCoupon(code: string): Promise<void> {
    await ensureReady();
    await db.coupons.delete(code);
  }

  async createTicket(ticketDraft: TicketCreateInput): Promise<{ ticket: Ticket; accessCode: string }> {
    await ensureReady();
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
    await db.tickets.put(ticket);
    const accessCode = createId("ticketAccess");
    this.ticketAccessCodes.set(ticket.id, accessCode);
    return { ticket, accessCode };
  }

  async updateTicket(ticket: Ticket): Promise<void> {
    await ensureReady();
    await db.tickets.put({ ...ticket, updatedAt: nowIso() });
  }

  async listTickets(params: ListTicketsParams = {}): Promise<{ items: Ticket[]; total: number }> {
    await ensureReady();
    let collection = db.tickets.toCollection();
    if (params.status) {
      collection = collection.filter((ticket) => ticket.status === params.status);
    }
    if (params.labels?.length) {
      collection = collection.filter((ticket) => params.labels!.every((label) => ticket.labels.includes(label)));
    }
    if (params.search) {
      const search = params.search;
      collection = collection.filter((ticket) =>
        matchesSearch(ticket.title, search) ||
        matchesSearch(ticket.body, search) ||
        matchesSearch(ticket.requesterEmail, search),
      );
    }
    const all = await collection.toArray();
    const sorted = all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const pageSize = params.pageSize ?? 20;
    const page = params.page ?? 1;
    const start = (page - 1) * pageSize;
    const items = sorted.slice(start, start + pageSize);
    return { items, total: sorted.length };
  }

  async getTicket(id: ID, options?: { accessCode?: string }): Promise<Ticket | null> {
    await ensureReady();
    const ticket = await db.tickets.get(id);
    if (!ticket) return null;
    const storedCode = this.ticketAccessCodes.get(id);
    if (storedCode && options?.accessCode && storedCode !== options.accessCode) {
      return null;
    }
    return ticket;
  }

  async listContentBlocks(): Promise<ContentBlock[]> {
    await ensureReady();
    return db.contentBlocks.toArray();
  }

  async upsertContentBlock(block: ContentBlock): Promise<void> {
    await ensureReady();
    await db.contentBlocks.put({ ...block, updatedAt: nowIso() });
  }

  async listGalleryItems(): Promise<GalleryItem[]> {
    await ensureReady();
    return db.galleryItems.toArray();
  }

  async upsertGalleryItem(item: GalleryItem): Promise<void> {
    await ensureReady();
    await db.galleryItems.put({ ...item, updatedAt: nowIso() });
  }

  async deleteGalleryItem(id: ID): Promise<void> {
    await ensureReady();
    await db.galleryItems.delete(id);
  }

  async listNewsletterSignups(): Promise<NewsletterSignup[]> {
    await ensureReady();
    return db.newsletter.toArray();
  }

  async addNewsletterSignup(signup: NewsletterSignup): Promise<void> {
    await ensureReady();
    await db.newsletter.put(signup);
  }

  async seed(): Promise<void> {
    await ensureReady();
    const data = buildSeedData();
    await db.transaction("rw", db.tables, async () => {
      await Promise.all(db.tables.map((table) => table.clear()));
      await db.products.bulkAdd(data.products);
      await db.reviews.bulkAdd(data.reviews);
      await db.orders.bulkAdd(data.orders);
      await db.coupons.bulkAdd(data.coupons);
      await db.tickets.bulkAdd(data.tickets);
      await db.contentBlocks.bulkAdd(data.contentBlocks);
      await db.galleryItems.bulkAdd(data.galleryItems);
      await db.newsletter.bulkAdd(data.newsletter);
    });
    this.ticketAccessCodes.clear();
  }
}

export function createIndexedDbProvider(): DataProvider {
  return new IndexedDbProvider();
}
