import { Controller, Get, Query } from "@nestjs/common";
import { SearchService } from "./search.service";
import { Public } from "../../common/decorators/public.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthUser } from "../../auth/auth.types";

@Controller({ path: "search" })
export class SearchController {
  constructor(private readonly search: SearchService) {}

  @Public()
  @Get()
  async searchAll(@Query("q") q: string | undefined, @CurrentUser() user: AuthUser | undefined) {
    if (!q || q.trim().length === 0) {
      return { results: [] };
    }
    const query = q.trim();
    const [products, tickets] = await Promise.all([
      this.search.searchProducts(query),
      this.search.searchTickets(query, user),
    ]);

    const results = [
      ...products.map((product) => ({ type: "product" as const, product })),
      ...tickets.map((ticket) => ({ type: "ticket" as const, ticket })),
    ];

    return { results };
  }
}
