import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import type { Product as ProductResponse } from "@data";
import { Product as ProductModel, Prisma } from "@prisma/client";
import { ProductCreateDto, ProductUpdateDto } from "./dto/product.dto";
import { sanitizeMarkdown, sanitizePlain } from "../../common/utils/sanitize";

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(params: {
    search?: string;
    tags?: string[];
    flavors?: string[];
    availableOnly?: boolean;
    skip?: number;
    take?: number;
  }): Promise<{ items: ProductResponse[]; total: number }> {
    const { search, tags, flavors, availableOnly, skip, take } = params;

    const where: Prisma.ProductWhereInput = {};

    if (search) {
      const like = search.trim();
      where.OR = [
        { name: { contains: like, mode: "insensitive" } },
        { descriptionMd: { contains: like, mode: "insensitive" } },
        { tags: { hasSome: [like.toLowerCase()] } },
      ];
    }

    if (tags?.length) {
      where.tags = { hasSome: tags };
    }

    if (flavors?.length) {
      where.flavors = { hasSome: flavors };
    }

    if (availableOnly) {
      where.isAvailable = true;
    }

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        orderBy: { name: "asc" },
        skip,
        take,
      }),
    ]);

    return {
      total,
      items: rows.map((product) => this.toResponse(product)),
    };
  }

  async get(idOrSlug: string): Promise<ProductResponse> {
    const product = await this.prisma.product.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
    });
    if (!product) {
      throw new NotFoundException("Product not found");
    }
    return this.toResponse(product);
  }

  async create(dto: ProductCreateDto): Promise<ProductResponse> {
    const created = await this.prisma.product.create({
      data: this.prepareData(dto) as Prisma.ProductUncheckedCreateInput,
    });
    return this.toResponse(created);
  }

  async update(id: string, dto: ProductUpdateDto): Promise<ProductResponse> {
    const updated = await this.prisma.product.update({
      where: { id },
      data: this.prepareData(dto),
    });
    return this.toResponse(updated);
  }

  async remove(id: string) {
    await this.prisma.product.delete({ where: { id } });
  }

  private prepareData(dto: Partial<ProductCreateDto | ProductUpdateDto>): Prisma.ProductUncheckedUpdateInput {
    const { subtitle, descriptionMd, ...rest } = dto;
    return {
      ...rest,
      subtitle: typeof subtitle === "string" ? sanitizePlain(subtitle) : subtitle ?? null,
      descriptionMd:
        typeof descriptionMd === "string"
          ? sanitizeMarkdown(descriptionMd)
          : (descriptionMd as string | undefined),
      flavors: dto.flavors ?? undefined,
      tags: dto.tags ?? undefined,
      images: dto.images ?? undefined,
      allergens: dto.allergens ?? undefined,
      nutrition: dto.nutrition ?? undefined,
    } as Prisma.ProductUncheckedUpdateInput;
  }

  private toResponse(product: ProductModel): ProductResponse {
    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      subtitle: product.subtitle ?? undefined,
      priceCents: product.priceCents,
      flavors: product.flavors ?? [],
      tags: product.tags ?? [],
      isAvailable: product.isAvailable,
      images: product.images ?? [],
      descriptionMd: product.descriptionMd,
      nutrition: (product.nutrition as Record<string, string> | null) ?? undefined,
      allergens: product.allergens ?? [],
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  }
}


