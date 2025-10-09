export type ID = string;

export type Role = "guest" | "customer" | "staff" | "support" | "admin";

export interface User {
  id: ID;
  email: string;
  name: string;
  role: Role;
  emailVerifiedAt?: string | null;
  createdAt: string;
}

export interface Product {
  id: ID;
  slug: string;
  name: string;
  subtitle?: string;
  priceCents: number;
  flavors: string[];
  tags: string[];
  isAvailable: boolean;
  images: string[];
  descriptionMd: string;
  nutrition?: Record<string, string>;
  allergens?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: ID;
  productId: ID;
  userName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title?: string;
  body: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: ID;
  qty: number;
}

export interface OrderItem {
  productId: ID;
  name: string;
  qty: number;
  priceCents: number;
}

export interface Order {
  id: ID;
  number: string;
  items: OrderItem[];
  subtotalCents: number;
  taxCents: number;
  shippingCents: number;
  totalCents: number;
  customer: { name: string; email: string; phone?: string };
  shipping?: { method: "pickup" | "delivery"; address?: string; date?: string };
  payment: { status: "unpaid" | "paid" | "refunded" | "demo-paid"; provider?: "stripe" };
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  code: string;
  pctOff?: number;
  amountOffCents?: number;
  active: boolean;
}

export type TicketStatus = "open" | "in_progress" | "waiting" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";

export interface TicketNote {
  by: ID;
  at: string;
  note: string;
}

export interface TicketAttachment {
  name: string;
  mime: string;
  dataUrl: string;
}

export interface Ticket {
  id: ID;
  number: string;
  title: string;
  body: string;
  status: TicketStatus;
  priority: TicketPriority;
  labels: string[];
  requesterEmail: string;
  requesterId?: ID;
  orderId?: ID;
  assigneeId?: ID;
  watchers?: ID[];
  internalNotes: TicketNote[];
  attachments: TicketAttachment[];
  createdAt: string;
  updatedAt: string;
}

export interface ContentBlock {
  id: ID;
  key: string;
  title: string;
  bodyMd: string;
  updatedAt: string;
}

export interface GalleryItem {
  id: ID;
  title: string;
  image: string;
  description?: string;
  updatedAt: string;
}

export interface NewsletterSignup {
  id: ID;
  email: string;
  createdAt: string;
}

export interface SeedSummary {
  products: number;
  reviews: number;
  orders: number;
  coupons: number;
  tickets: number;
  contentBlocks: number;
  galleryItems: number;
}
