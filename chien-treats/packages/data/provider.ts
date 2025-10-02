import type { Coupon, Order, Product, Review, Ticket, ID, ContentBlock, GalleryItem, NewsletterSignup, TicketStatus } from "./models";

export interface ListTicketsParams {
  status?: TicketStatus;
  search?: string;
  labels?: string[];
  page?: number;
  pageSize?: number;
}

export interface DataProvider {
  ready(): Promise<void>;
  reset(): Promise<void>;

  listProducts(): Promise<Product[]>;
  getProduct(idOrSlug: string): Promise<Product | null>;
  upsertProduct(product: Product): Promise<void>;
  deleteProduct(id: ID): Promise<void>;

  listReviews(productId: ID, status?: Review["status"]): Promise<Review[]>;
  submitReview(review: Review): Promise<Review>;
  setReviewStatus(reviewId: ID, status: Review["status"], rejectionReason?: string): Promise<void>;

  createOrder(order: Omit<Order, "id" | "number" | "createdAt" | "updatedAt">, options?: { demoPaid?: boolean }): Promise<Order>;
  updateOrder(order: Order): Promise<void>;
  listOrders(): Promise<Order[]>;
  getOrder(id: ID): Promise<Order | null>;

  listCoupons(): Promise<Coupon[]>;
  upsertCoupon(coupon: Coupon): Promise<void>;
  deleteCoupon(code: Coupon["code"]): Promise<void>;

  createTicket(ticket: Omit<Ticket, "id" | "number" | "createdAt" | "updatedAt">): Promise<Ticket>;
  updateTicket(ticket: Ticket): Promise<void>;
  listTickets(params?: ListTicketsParams): Promise<{ items: Ticket[]; total: number }>;
  getTicket(id: ID): Promise<Ticket | null>;

  listContentBlocks(): Promise<ContentBlock[]>;
  upsertContentBlock(block: ContentBlock): Promise<void>;

  listGalleryItems(): Promise<GalleryItem[]>;
  upsertGalleryItem(item: GalleryItem): Promise<void>;
  deleteGalleryItem(id: ID): Promise<void>;

  listNewsletterSignups(): Promise<NewsletterSignup[]>;
  addNewsletterSignup(signup: NewsletterSignup): Promise<void>;

  seed(): Promise<void>;
}

export type DataProviderFactory = () => DataProvider;

export type DataProviderKind = "indexeddb" | "memory";

export interface CreateProviderOptions {
  kind?: DataProviderKind;
}
