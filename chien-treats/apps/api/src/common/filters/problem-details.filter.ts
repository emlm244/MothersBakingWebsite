import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Logger } from "nestjs-pino";
import { ConfigService } from "@nestjs/config";
import {
  ProblemException,
  ProblemDetail,
  problemTypes,
  toProblemJson,
} from "../errors/problem-details";

@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  constructor(
    private readonly logger: Logger,
    private readonly config: ConfigService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    const problem = this.mapException(exception, request.url);
    const status = problem.status ?? HttpStatus.INTERNAL_SERVER_ERROR;

    const err = exception instanceof Error ? exception : new Error(String(exception));
    this.logger.error({ err, problem, path: request.url }, problem.title);

    void reply
      .status(status)
      .type("application/problem+json")
      .headers({ "Cache-Control": "no-store" })
      .send(toProblemJson(problem));
  }

  private mapException(exception: unknown, instance?: string): ProblemDetail {
    if (exception instanceof ProblemException) {
      return { ...exception.problem, instance };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse() as
        | { message?: string | string[]; error?: string; statusCode?: number }
        | string;

      const detail = typeof response === "string" ? response : response.message;
      return {
        type: this.typeForStatus(status),
        title: typeof response === "string" ? response : response.error ?? "HTTP Error",
        status,
        detail: Array.isArray(detail) ? detail.join("; ") : detail,
        instance,
      };
    }

    const appConfig = this.config.get("app");
    const isProd = appConfig?.isProduction;

    return {
      type: problemTypes.server,
      title: "Internal Server Error",
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      detail: isProd ? undefined : exception instanceof Error ? exception.message : String(exception),
      instance,
    };
  }

  private typeForStatus(status: number) {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return problemTypes.validation;
      case HttpStatus.UNAUTHORIZED:
        return problemTypes.unauthorized;
      case HttpStatus.FORBIDDEN:
        return problemTypes.forbidden;
      case HttpStatus.NOT_FOUND:
        return problemTypes.notFound;
      case HttpStatus.CONFLICT:
        return problemTypes.conflict;
      case HttpStatus.NOT_IMPLEMENTED:
        return problemTypes.notImplemented;
      case HttpStatus.TOO_MANY_REQUESTS:
        return problemTypes.rateLimited;
      default:
        return problemTypes.server;
    }
  }
}
