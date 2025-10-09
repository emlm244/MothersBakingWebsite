export interface PaginationQuery {
  page?: number | string;
  limit?: number | string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
  take: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export function resolvePagination(query: PaginationQuery | undefined): PaginationParams {
  const pageRaw = typeof query?.page === "string" ? parseInt(query.page, 10) : Number(query?.page ?? DEFAULT_PAGE);
  const limitRaw = typeof query?.limit === "string" ? parseInt(query.limit, 10) : Number(query?.limit ?? DEFAULT_LIMIT);

  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : DEFAULT_PAGE;
  const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, MAX_LIMIT) : DEFAULT_LIMIT;

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit,
  };
}

export function applyPaginationHeader(total: number, page: number, limit: number) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    total,
    totalPages,
    page,
    limit,
  } as const;
}
