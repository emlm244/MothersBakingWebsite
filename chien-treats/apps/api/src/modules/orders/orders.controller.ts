import { Body, Controller, Get, Param, Patch, Post, Query, Res } from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { OrderCreateDto, OrderUpdateDto, DemoPayDto } from "./dto/order.dto";
import { Public } from "../../common/decorators/public.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthUser } from "../../auth/auth.types";
import { Roles } from "../../common/decorators/roles.decorator";
import { resolvePagination, applyPaginationHeader } from "../../common/utils/pagination";
import type { FastifyReply } from "fastify";

@Controller({ path: "orders" })
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Roles("admin", "staff", "support")
  @Get()
  async list(@Query() query: Record<string, unknown>, @Res({ passthrough: true }) res: FastifyReply) {
    const pagination = resolvePagination({
      page: query.page as string | number,
      limit: query.limit as string | number,
    });

    const { items, total } = await this.orders.list({ skip: pagination.skip, take: pagination.take });

    const meta = applyPaginationHeader(total, pagination.page, pagination.limit);
    res.header("X-Total-Count", meta.total.toString());
    res.header("X-Page", meta.page.toString());
    res.header("X-Total-Pages", meta.totalPages.toString());
    res.header("X-Page-Limit", meta.limit.toString());

    return { items, total };
  }

  @Get(":id")
  async get(@Param("id") id: string, @CurrentUser() user: AuthUser | undefined) {
    const order = await this.orders.get(id, user);
    return { order };
  }

  @Public()
  @Post()
  async create(@Body() dto: OrderCreateDto, @CurrentUser() user: AuthUser | undefined) {
    const order = await this.orders.create(dto, user);
    return { order };
  }

  @Roles("admin", "staff")
  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: OrderUpdateDto) {
    const order = await this.orders.update(id, dto);
    return { order };
  }

  @Roles("admin", "staff")
  @Post(":id/demo-pay")
  async demoPay(@Param("id") id: string, @Body() _dto: DemoPayDto) {
    const order = await this.orders.markDemoPaid(id);
    return { order };
  }
}
