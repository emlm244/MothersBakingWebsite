import { generateFlavorArt } from "./flavor-art";
import type {
  ContentBlock,
  Coupon,
  GalleryItem,
  NewsletterSignup,
  Order,
  Product,
  Review,
  SeedSummary,
  Ticket,
} from "./models";
import { createId, nowIso, toSlug } from "./utils";

export interface SeedData {
  products: Product[];
  reviews: Review[];
  orders: Order[];
  coupons: Coupon[];
  tickets: Ticket[];
  contentBlocks: ContentBlock[];
  galleryItems: GalleryItem[];
  newsletter: NewsletterSignup[];
}

const COLOR_MAP: Record<string, string> = {
  "Honey Lavender": "#D2B7E5",
  "Strawberry Milk": "#F9A8D4",
  "Chocolate Ganache": "#B08968",
  "Matcha Vanilla": "#A3D9A5",
  "Salted Caramel": "#F0B67F",
  "Pistachio Rose": "#C1E1C1",
};

const FLAVOR_TAGS: Record<string, string[]> = {
  "Honey Lavender": ["floral", "best-seller"],
  "Strawberry Milk": ["fruity", "kid-favorite"],
  "Chocolate Ganache": ["classic", "chocolate"],
  "Matcha Vanilla": ["tea", "zen"],
  "Salted Caramel": ["salty-sweet"],
  "Pistachio Rose": ["nutty", "floral"],
};

const BASE_DESCRIPTION = `**Hand piped shells** with silky ganache and buttercreams.\n\n- Baked fresh in small batches\n- Naturally gluten friendly\n- Packed in compostable boxes`;

export function buildSeedData(): SeedData {
  const createdAt = nowIso();

  const products: Product[] = Object.keys(COLOR_MAP).map((name) => {
    const id = createId("prod");
    return {
      id,
      slug: toSlug(name),
      name,
      subtitle: `${name} macaron`,
      priceCents: 320,
      flavors: [name],
      tags: FLAVOR_TAGS[name] ?? [],
      isAvailable: true,
      images: [generateFlavorArt(name, COLOR_MAP[name])],
      descriptionMd: BASE_DESCRIPTION,
      nutrition: {
        calories: "110",
        sugar: "12g",
        protein: "2g",
      },
      allergens: ["Almonds", "Egg Whites"],
      createdAt,
      updatedAt: createdAt,
    } satisfies Product;
  });

  const reviews: Review[] = products.slice(0, 3).flatMap((product, idx) => {
    const now = nowIso();
    return [
      {
        id: createId("rev"),
        productId: product.id,
        userName: "Linh P.",
        rating: 5,
        title: "Perfect texture",
        body: "The shells are crisp with a gooey center - truly artisanal.",
        status: "approved",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: createId("rev"),
        productId: product.id,
        userName: "Jordan C.",
        rating: (4 - (idx % 2)) as 3 | 4,
        body: "Loved the flavor balance and the adorable packaging!",
        status: idx % 2 === 0 ? "approved" : "pending",
        createdAt: now,
        updatedAt: now,
      },
    ];
  });

  const orders: Order[] = [
    {
      id: createId("ord"),
      number: `ORD-${Math.floor(Math.random() * 9000 + 1000)}`,
      items: products.slice(0, 2).map((product) => ({
        productId: product.id,
        name: product.name,
        qty: 2,
        priceCents: product.priceCents,
      })),
      subtotalCents: 1280,
      taxCents: 102,
      shippingCents: 0,
      totalCents: 1382,
      customer: { name: "Maya Tran", email: "maya@example.com" },
      shipping: { method: "pickup", date: createdAt },
      payment: { status: "demo-paid", provider: "stripe" },
      createdAt,
      updatedAt: createdAt,
    },
  ];

  const coupons: Coupon[] = [
    { code: "WELCOME10", pctOff: 10, active: true },
    { code: "SPRING15", pctOff: 15, active: false },
  ];

  const tickets: Ticket[] = [
    {
      id: createId("tick"),
      number: "TIC-1024",
      title: "Pickup time change",
      body: "Can I pick up my macaron box 30 minutes later?",
      status: "open",
      priority: "medium",
      labels: ["orders"],
      requesterEmail: "maya@example.com",
      orderId: orders[0]?.id,
      assigneeId: undefined,
      watchers: [],
      internalNotes: [],
      attachments: [],
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: createId("tick"),
      number: "TIC-1025",
      title: "Custom flavor request",
      body: "Do you offer vegan shells for corporate gifting?",
      status: "waiting",
      priority: "high",
      labels: ["custom", "product"],
      requesterEmail: "leo@wowstudio.dev",
      orderId: undefined,
      assigneeId: undefined,
      watchers: [],
      internalNotes: [],
      attachments: [],
      createdAt,
      updatedAt: createdAt,
    },
  ];

  const contentBlocks: ContentBlock[] = [
    {
      id: createId("content"),
      key: "about",
      title: "Our Story",
      bodyMd: "Chien began whisking buttercream as a kid in Taipei and now bakes small-batch macarons in Seattle. Every order supports local farms and rescue pets.",
      updatedAt: createdAt,
    },
    {
      id: createId("content"),
      key: "faq",
      title: "FAQ",
      bodyMd: "**How far ahead should I order?** Give us 48 hours for standard boxes, one week for custom events.",
      updatedAt: createdAt,
    },
  ];

  const galleryItems: GalleryItem[] = products.map((product) => ({
    id: createId("gallery"),
    title: `${product.name} Tower`,
    image: product.images[0]!,
    description: `Stacked macarons in ${product.name} shades`,
    updatedAt: createdAt,
  }));

  const newsletter: NewsletterSignup[] = [
    { id: createId("news"), email: "sam@biteclub.co", createdAt },
    { id: createId("news"), email: "dev@macarons.studio", createdAt },
  ];

  return {
    products,
    reviews,
    orders,
    coupons,
    tickets,
    contentBlocks,
    galleryItems,
    newsletter,
  };
}

export function summarizeSeed(data: SeedData): SeedSummary {
  return {
    products: data.products.length,
    reviews: data.reviews.length,
    orders: data.orders.length,
    coupons: data.coupons.length,
    tickets: data.tickets.length,
    contentBlocks: data.contentBlocks.length,
    galleryItems: data.galleryItems.length,
  };
}
