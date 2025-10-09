import { BadRequestException, Body, Controller, Get, Param, Patch, Post, Query, Req, Res, UseGuards } from "@nestjs/common";
import { TicketsService } from "./tickets.service";
import { TicketCreateDto, TicketNoteDto, TicketUpdateDto } from "./dto/ticket.dto";
import { Public } from "../../common/decorators/public.decorator";
import { resolvePagination, applyPaginationHeader } from "../../common/utils/pagination";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { AuthUser } from "../../auth/auth.types";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { OptionalJwtGuard } from "../../auth/guards/optional-jwt.guard";

@Controller({ path: "tickets" })
export class TicketsController {
  constructor(private readonly tickets: TicketsService) {}

  @Roles("support", "admin", "staff")
  @Get()
  async list(@Query() query: Record<string, unknown>, @Res({ passthrough: true }) res: FastifyReply) {
    const pagination = resolvePagination({ page: query.page as string | number, limit: query.limit as string | number });
    const labels = this.parseArray(query.labels);
    const { items, total } = await this.tickets.list({
      status: query.status as any,
      priority: query.priority as any,
      labels,
      assigneeId: typeof query.assigneeId === "string" ? query.assigneeId : undefined,
      search: typeof query.search === "string" ? query.search : undefined,
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
  @UseGuards(OptionalJwtGuard)
  @Get(":id")
  async get(@Param("id") id: string, @Query("accessCode") accessCode: string | undefined, @CurrentUser() user: AuthUser | undefined) {
    const ticket = await this.tickets.get(id, accessCode, user);
    return { ticket };
  }

  @Post()
  async create(@Body() dto: TicketCreateDto, @CurrentUser() user: AuthUser) {
    const result = await this.tickets.create(dto, user);
    return result;
  }

  @Roles("support", "admin", "staff")
  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: TicketUpdateDto, @CurrentUser() user: AuthUser) {
    const ticket = await this.tickets.update(id, dto, user);
    return { ticket };
  }

  @Roles("support", "admin", "staff")
  @Post(":id/notes")
  async addNote(@Param("id") id: string, @Body() dto: TicketNoteDto, @CurrentUser() user: AuthUser) {
    const ticket = await this.tickets.addNote(id, dto, user);
    return { ticket };
  }

  @Post(":id/attachments")
  async addAttachment(
    @Param("id") id: string,
    @Req() req: FastifyRequest,
    @CurrentUser() user: AuthUser,
  ) {
    const file = await req.file();
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }
    const buffer = await file.toBuffer();
    const ticket = await this.tickets.addAttachment(id, { buffer, mimetype: file.mimetype, originalname: file.filename }, user);
    return { ticket };
  }

  @Roles("support", "admin", "staff")
  @Get("export/csv")
  async exportCsv(@Res() res: FastifyReply) {
    const csv = await this.tickets.exportCsv();
    res.header("Content-Type", "text/csv");
    res.header("Content-Disposition", 'attachment; filename="tickets.csv"');
    res.send(csv);
  }

  @Roles("admin", "staff")
  @Post("import/csv")
  async importCsv(@Req() req: FastifyRequest, @CurrentUser() user: AuthUser) {
    const file = await req.file();
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }
    const buffer = await file.toBuffer();
    const result = await this.tickets.importCsv(buffer, user);
    return result;
  }

  private parseArray(value: unknown): string[] | undefined {
    if (Array.isArray(value)) {
      return value.map(String).filter(Boolean);
    }
    if (typeof value === "string") {
      return value.split(",").map((item) => item.trim()).filter(Boolean);
    }
    return undefined;
  }
}
