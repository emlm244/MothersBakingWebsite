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

type Fetcher = typeof fetch;

interface RequestOptions extends RequestInit {
  unwrap?: string;
  expect?: "json" | "void";
}

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "guest" | "customer" | "staff" | "support" | "admin";
  emailVerifiedAt?: string | null;
}

interface LoginResponse {
  user: AuthUser;
  accessToken: string;
}

interface RegisterResponse {
  user: AuthUser;
}

interface VerifyResponse {
  user: AuthUser;
}

function resolveFetch(fetchImpl?: Fetcher): Fetcher {
  if (fetchImpl) {
    return fetchImpl;
  }
  if (typeof fetch !== "undefined") {
    return fetch;
  }
  throw new Error("fetch implementation is required for RestProvider");
}

function toQueryString(params: Record<string, unknown>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item) => search.append(key, String(item)));
    } else {
      search.set(key, String(value));
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

class RestProviderImpl implements DataProvider {
  private token: string | null;
  private readonly fetchFn: Fetcher;

  constructor(
    private readonly baseUrl: string = "http://localhost:4000/api/v1",
    fetchImpl?: Fetcher,
  ) {
    this.fetchFn = resolveFetch(fetchImpl);
    this.token = typeof window !== "undefined" ? window.localStorage.getItem("auth_token") : null;
  }

  // Authentication helpers ---------------------------------------------------

  private persistToken(token: string | null) {
    this.token = token;
    if (typeof window !== "undefined") {
      if (token) {
        window.localStorage.setItem("auth_token", token);
      } else {
        window.localStorage.removeItem("auth_token");
      }
    }
  }

  private buildHeaders(extra?: HeadersInit) {
    const headers = new Headers(extra);
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    if (this.token) {
      headers.set("Authorization", `Bearer ${this.token}`);
    }
    return headers;
  }

  private async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const url = path.startsWith("http") ? path : `${this.baseUrl}${path}`;
    const response = await this.fetchFn(url, {
      credentials: "include",
      ...options,
      headers: this.buildHeaders(options.headers),
    });

    if (!response.ok) {
      let message = `HTTP ${response.status}`;
      try {
        const payload = await response.json();
        message = payload.detail ?? payload.title ?? message;
      } catch {
        // ignore parsing failure
      }
      throw new Error(message);
    }

    if (options.expect === "void" || response.status === 204) {
      return undefined as T;
    }

    const data = (await response.json()) as unknown;
    if (options.unwrap && data && typeof data === "object" && options.unwrap in (data as Record<string, unknown>)) {
      return (data as Record<string, unknown>)[options.unwrap] as T;
    }
    return data as T;
  }

  // Public authentication API ------------------------------------------------

  async login(email: string, password: string): Promise<{ user: AuthUser; token: string }> {
    const { user, accessToken } = await this.request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    this.persistToken(accessToken);
    return { user, token: accessToken };
  }

  async register(name: string, email: string, password: string): Promise<{ user: AuthUser; token: string | null }> {
    const { user } = await this.request<RegisterResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    // Registration endpoint does not issue tokens; require login afterwards.
    return { user, token: null };
  }

  async requestEmailVerification(email: string): Promise<void> {
    await this.request("/auth/verify/request", {
      method: "POST",
      body: JSON.stringify({ email }),
      expect: "void",
    });
  }

  async confirmEmailVerification(token: string): Promise<AuthUser> {
    const { user } = await this.request<VerifyResponse>("/auth/verify/confirm", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
    return user;
  }

  logout(): void {
    void this.request<unknown>("/auth/logout", { method: "POST", expect: "void" }).catch(() => undefined);
    this.persistToken(null);
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { user } = await this.request<{ user: AuthUser }>("/auth/me");
      return user ?? null;
    } catch (error) {
      return null;
    }
  }

  // DataProvider implementation ----------------------------------------------

  async ready(): Promise<void> {
    return;
  }

  async reset(): Promise<void> {
    throw new Error("Reset is not supported for the REST data provider.");
  }

  async listProducts(): Promise<Product[]> {
    const { items } = await this.request<{ items: Product[] }>("/products");
    return items;
  }

  async getProduct(idOrSlug: string): Promise<Product | null> {
    try {
      return await this.request<Product>(`/products/${idOrSlug}`);
    } catch {
      return null;
    }
  }

  async upsertProduct(_product: Product): Promise<void> {
    throw new Error("Product management is not yet supported via REST provider.");
  }

  async deleteProduct(_id: ID): Promise<void> {
    throw new Error("Product management is not yet supported via REST provider.");
  }

  async listReviews(productId: ID, status: Review["status"] = "approved"): Promise<Review[]> {
    const query = toQueryString({ status });
    const { items } = await this.request<{ items: Review[] }>(`/products/${productId}/reviews${query}`);
    return items;
  }

  async submitReview(review: Review): Promise<Review> {
    const created = await this.request<Review>("/reviews", {
      method: "POST",
      body: JSON.stringify(review),
      unwrap: "review",
    });
    return created;
  }

  async setReviewStatus(_reviewId: ID, _status: Review["status"], _reason?: string): Promise<void> {
    throw new Error("Review moderation requires elevated privileges. Not implemented in REST provider.");
  }

  async createOrder(
    orderDraft: Omit<Order, "id" | "number" | "payment" | "createdAt" | "updatedAt">,
    options?: { demoPaid?: boolean },
  ): Promise<Order> {
    const payload = {
      items: orderDraft.items.map((item) => ({ productId: item.productId, qty: item.qty })),
      customer: orderDraft.customer,
      shipping: orderDraft.shipping,
      couponCode: (orderDraft as { couponCode?: string }).couponCode,
      demo: Boolean(options?.demoPaid),
    };
    const order = await this.request<Order>("/orders", {
      method: "POST",
      body: JSON.stringify(payload),
      unwrap: "order",
    });
    return order;
  }

  async updateOrder(_order: Order): Promise<void> {
    throw new Error("Order updates are not exposed through the REST provider yet.");
  }

  async listOrders(): Promise<Order[]> {
    throw new Error("Order listing requires staff authentication and is not implemented in REST provider.");
  }

  async getOrder(id: ID): Promise<Order | null> {
    try {
      const order = await this.request<Order>(`/orders/${id}`, { unwrap: "order" });
      return order;
    } catch {
      return null;
    }
  }

  async listCoupons(): Promise<Coupon[]> {
    // The public API exposes validation rather than full coupon catalog.
    return [];
  }

  async upsertCoupon(_coupon: Coupon): Promise<void> {
    throw new Error("Coupon management is not available in REST provider.");
  }

  async deleteCoupon(_code: Coupon["code"]): Promise<void> {
    throw new Error("Coupon management is not available in REST provider.");
  }

  async validateCoupon(code: string): Promise<CouponValidationResult> {
    return this.request<CouponValidationResult>("/coupons/validate", {
      method: "POST",
      body: JSON.stringify({ code }),
    });
  }

  async createTicket(ticket: TicketCreateInput): Promise<{ ticket: Ticket; accessCode: string }> {
    const payload: Record<string, unknown> = {
      title: ticket.title,
      body: ticket.body,
      priority: ticket.priority,
    };
    if (ticket.labels) {
      payload.labels = ticket.labels;
    }
    if (ticket.orderId) {
      payload.orderId = ticket.orderId;
    }
    const result = await this.request<{ ticket: Ticket; accessCode: string }>("/tickets", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return result;
  }

  async updateTicket(_ticket: Ticket): Promise<void> {
    throw new Error("Ticket updates are not yet supported via REST provider.");
  }

  async listTickets(_params?: ListTicketsParams): Promise<{ items: Ticket[]; total: number }> {
    throw new Error("Ticket listing requires staff access; not implemented in REST provider.");
  }

  async getTicket(id: ID, options?: { accessCode?: string }): Promise<Ticket | null> {
    const query = toQueryString({ accessCode: options?.accessCode });
    try {
      const { ticket } = await this.request<{ ticket: Ticket }>(`/tickets/${id}${query}`);
      return ticket;
    } catch {
      return null;
    }
  }

  async listContentBlocks(): Promise<ContentBlock[]> {
    throw new Error("Content management is not available through the REST provider.");
  }

  async upsertContentBlock(_block: ContentBlock): Promise<void> {
    throw new Error("Content management is not available through the REST provider.");
  }

  async listGalleryItems(): Promise<GalleryItem[]> {
    throw new Error("Gallery endpoints are not available through the REST provider.");
  }

  async upsertGalleryItem(_item: GalleryItem): Promise<void> {
    throw new Error("Gallery management is not available through the REST provider.");
  }

  async deleteGalleryItem(_id: ID): Promise<void> {
    throw new Error("Gallery management is not available through the REST provider.");
  }

  async listNewsletterSignups(): Promise<NewsletterSignup[]> {
    throw new Error("Newsletter directory is not exposed via REST provider.");
  }

  async addNewsletterSignup(_signup: NewsletterSignup): Promise<void> {
    throw new Error("Newsletter collection is not available via REST provider.");
  }

  async seed(): Promise<void> {
    throw new Error("Seeding data is not supported via REST provider.");
  }
}

export const restProvider = new RestProviderImpl();

export function createRestProvider(baseUrl?: string, fetchImpl?: Fetcher): RestProviderImpl {
  return new RestProviderImpl(baseUrl, fetchImpl);
}
