import { Body, Controller, Delete, Get, Param, Post, Put, Query, Res } from "@nestjs/common";
import { ProductsService } from "./products.service";
import { ProductCreateDto, ProductUpdateDto } from "./dto/product.dto";
import { Public } from "../../common/decorators/public.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { resolvePagination, applyPaginationHeader } from "../../common/utils/pagination";
import type { FastifyReply } from "fastify";

@Controller({ path: "products" })
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Public()
  @Get()
  async list(@Query() query: Record<string, unknown>, @Res({ passthrough: true }) res: FastifyReply) {
    const pagination = resolvePagination({ page: query.page as number | string, limit: query.limit as number | string });

    const tags = this.parseStringArray(query.tags);
    const flavors = this.parseStringArray(query.flavors);
    const availableOnly = this.parseBoolean(query.availableOnly);
    const search = typeof query.search === "string" ? query.search : undefined;

    const { items, total } = await this.products.list({
      search,
      tags,
      flavors,
      availableOnly,
      skip: pagination.skip,
      take: pagination.take,
    });

    const meta = applyPaginationHeader(total, pagination.page, pagination.limit);
    res.header("X-Total-Count", meta.total.toString());
    res.header("X-Page", meta.page.toString());
    res.header("X-Total-Pages", meta.totalPages.toString());
    res.header("X-Page-Limit", meta.limit.toString());

    return { items, total };
  }

  @Public()
  @Get(":idOrSlug")
  async get(@Param("idOrSlug") idOrSlug: string) {
    return this.products.get(idOrSlug);
  }

  @Roles("admin", "staff")
  @Post()
  async create(@Body() dto: ProductCreateDto) {
    return this.products.create(dto);
  }

  @Roles("admin", "staff")
  @Put(":id")
  async update(@Param("id") id: string, @Body() dto: ProductUpdateDto) {
    return this.products.update(id, dto);
  }

  @Roles("admin", "staff")
  @Delete(":id")
  async delete(@Param("id") id: string) {
    await this.products.remove(id);
    return { success: true };
  }

  private parseStringArray(value: unknown): string[] | undefined {
    if (Array.isArray(value)) {
      return value.map(String).filter(Boolean);
    }
    if (typeof value === "string" && value.trim().length > 0) {
      return value.split(",").map((part) => part.trim()).filter(Boolean);
    }
    return undefined;
  }

  private parseBoolean(value: unknown): boolean | undefined {
    if (typeof value === "boolean") {
      return value;
    }
    if (typeof value === "string") {
      if (["true", "1", "yes"].includes(value.toLowerCase())) {
        return true;
      }
      if (["false", "0", "no"].includes(value.toLowerCase())) {
        return false;
      }
    }
    return undefined;
  }
}
