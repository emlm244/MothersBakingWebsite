"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const seed_1 = require("@data/seed");
const utils_1 = require("@data/utils");
const argon2 = __importStar(require("argon2"));
const prisma = new client_1.PrismaClient();
async function main() {
    const adminEmail = "admin@chiens.treats";
    const adminPassword = process.env.ADMIN_PASSWORD ?? "changeme!";
    const passwordHash = await argon2.hash(adminPassword);
    await prisma.user.upsert({
        where: { email: adminEmail },
        update: { passwordHash, role: client_1.Role.admin, name: "Chien Admin" },
        create: {
            email: adminEmail,
            name: "Chien Admin",
            role: client_1.Role.admin,
            passwordHash,
        },
    });
    const seed = (0, seed_1.buildSeedData)();
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
                status: review.status,
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
                status: review.status,
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
        const accessCode = (0, utils_1.createId)("ticketAccess");
        const accessCodeHash = await argon2.hash(accessCode);
        await prisma.ticket.upsert({
            where: { id: ticket.id },
            update: {
                title: ticket.title,
                status: ticket.status,
                priority: ticket.priority,
                labels: ticket.labels,
            },
            create: {
                id: ticket.id,
                number: ticket.number,
                title: ticket.title,
                body: ticket.body,
                status: ticket.status,
                priority: ticket.priority,
                labels: ticket.labels,
                requesterEmail: ticket.requesterEmail,
                orderId: ticket.orderId ?? null,
                assigneeId: ticket.assigneeId ?? null,
                watchers: ticket.watchers ?? [],
                internalNotes: ticket.internalNotes,
                attachments: [],
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
                items: order.items,
                subtotalCents: order.subtotalCents,
                taxCents: order.taxCents,
                shippingCents: order.shippingCents,
                totalCents: order.totalCents,
                customer: order.customer,
                shipping: order.shipping,
                payment: order.payment,
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
