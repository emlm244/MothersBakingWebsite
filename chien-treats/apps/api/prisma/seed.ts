import { PrismaClient, Role, TicketPriority, TicketStatus, Prisma } from "@prisma/client";
import { buildSeedData } from "@data/seed";
import { createId, nowIso } from "@data/utils";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@chiens.treats";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "changeme!";
  const passwordHash = await argon2.hash(adminPassword);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash, role: Role.admin, name: "Chien Admin", emailVerifiedAt: new Date() },
    create: {
      email: adminEmail,
      name: "Chien Admin",
      role: Role.admin,
      passwordHash,
      emailVerifiedAt: new Date(),
    },
  });

  const seed = buildSeedData();

  for (const product of seed.products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {
        name: product.name,
        slug: product.slug,
        subtitle: product.subtitle ?? null,
        priceCents: product.priceCents,
        flavors: product.flavors,
        tags: product.tags,
        isAvailable: product.isAvailable,
        images: product.images,
        descriptionMd: product.descriptionMd,
        nutrition: product.nutrition ?? undefined,
        allergens: product.allergens ?? [],
      },
      create: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        subtitle: product.subtitle ?? null,
        priceCents: product.priceCents,
        flavors: product.flavors,
        tags: product.tags,
        isAvailable: product.isAvailable,
        images: product.images,
        descriptionMd: product.descriptionMd,
        nutrition: product.nutrition ?? undefined,
        allergens: product.allergens ?? [],
      },
    });
  }

  for (const review of seed.reviews) {
    await prisma.review.upsert({
      where: { id: review.id },
      update: {
        status: review.status as any,
        body: review.body,
        userName: review.userName,
        rating: review.rating,
      },
      create: {
        id: review.id,
        productId: review.productId,
        userName: review.userName,
        rating: review.rating,
        title: review.title ?? null,
        body: review.body,
        status: review.status as any,
        rejectionReason: review.rejectionReason ?? null,
      },
    });
  }

  for (const coupon of seed.coupons) {
    await prisma.coupon.upsert({
      where: { code: coupon.code },
      update: {
        pctOff: coupon.pctOff ?? null,
        amountOffCents: coupon.amountOffCents ?? null,
        active: coupon.active,
      },
      create: {
        code: coupon.code,
        pctOff: coupon.pctOff ?? null,
        amountOffCents: coupon.amountOffCents ?? null,
        active: coupon.active,
      },
    });
  }

  for (const ticket of seed.tickets) {
    const accessCode = createId("ticketAccess");
    const accessCodeHash = await argon2.hash(accessCode);
    await prisma.ticket.upsert({
      where: { id: ticket.id },
      update: {
        title: ticket.title,
        status: ticket.status as TicketStatus,
        priority: ticket.priority as TicketPriority,
        labels: ticket.labels,
      },
      create: {
        id: ticket.id,
        number: ticket.number,
        title: ticket.title,
        body: ticket.body,
        status: ticket.status as TicketStatus,
        priority: ticket.priority as TicketPriority,
        labels: ticket.labels,
        requesterEmail: ticket.requesterEmail,
        orderId: ticket.orderId ?? null,
        assigneeId: ticket.assigneeId ?? null,
        watchers: ticket.watchers ?? [],
        internalNotes: (ticket.internalNotes ?? []) as unknown as Prisma.InputJsonValue,
        attachments: [] as Prisma.InputJsonValue,
        accessCodeHash,
      },
    });
  }

  for (const order of seed.orders) {
    await prisma.order.upsert({
      where: { id: order.id },
      update: {
        subtotalCents: order.subtotalCents,
        taxCents: order.taxCents,
        shippingCents: order.shippingCents,
        totalCents: order.totalCents,
      },
      create: {
        id: order.id,
        number: order.number,
        items: order.items as unknown as Prisma.InputJsonValue,
        subtotalCents: order.subtotalCents,
        taxCents: order.taxCents,
        shippingCents: order.shippingCents,
        totalCents: order.totalCents,
        customer: order.customer as unknown as Prisma.InputJsonValue,
        shipping: (order.shipping ?? null) as unknown as Prisma.InputJsonValue,
        payment: order.payment as unknown as Prisma.InputJsonValue,
        couponCode: order.customer.email.includes("demo") ? "WELCOME10" : null,
      },
    });
  }

  for (const block of seed.contentBlocks) {
    await prisma.contentBlock.upsert({
      where: { key: block.key },
      update: {
        title: block.title,
        bodyMd: block.bodyMd,
      },
      create: {
        id: block.id,
        key: block.key,
        title: block.title,
        bodyMd: block.bodyMd,
      },
    });
  }

  console.log(`Seed completed. Admin login: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
