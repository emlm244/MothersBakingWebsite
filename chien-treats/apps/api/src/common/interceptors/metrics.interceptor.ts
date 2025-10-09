import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Observable } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { MetricsService } from "../../metrics/metrics.service";

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metrics: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const start = Date.now();
    const httpCtx = context.switchToHttp();
    const request = httpCtx.getRequest<FastifyRequest>();

    return next.handle().pipe(
      tap(() => {
        const response = httpCtx.getResponse<FastifyReply>();
        this.observe(request, response.statusCode, Date.now() - start);
      }),
      catchError((error: unknown) => {
        const response = httpCtx.getResponse<FastifyReply>();
        const status =
          typeof (error as { status?: number })?.status === "number"
            ? (error as { status?: number }).status!
            : response.statusCode ?? 500;
        this.observe(request, status, Date.now() - start);
        throw error;
      }),
    );
  }

  private observe(request: FastifyRequest, status: number, durationMs: number) {
    const rawPath = (request as unknown as Record<string, unknown>).routerPath ?? request.raw.url ?? request.url;
    const path = typeof rawPath === "string" ? rawPath : request.url;
    this.metrics.observeRequest(request.method, path, status, durationMs);
  }
}
