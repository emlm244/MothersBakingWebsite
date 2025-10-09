import { HttpStatus } from "@nestjs/common";

export interface ProblemDetail {
  type: string;
  title: string;
  status: HttpStatus;
  detail?: string;
  instance?: string;
  errors?: Array<{ field: string; message: string }>;
}

export const toProblemJson = (problem: ProblemDetail) => ({
  type: problem.type,
  title: problem.title,
  status: problem.status,
  detail: problem.detail,
  instance: problem.instance,
  errors: problem.errors?.length ? problem.errors : undefined,
});

export class ProblemException extends Error {
  constructor(public readonly problem: ProblemDetail) {
    super(problem.title);
  }
}

export const problemTypes = {
  validation: "https://chiens.treats/problems/validation-error",
  unauthorized: "https://chiens.treats/problems/unauthorized",
  forbidden: "https://chiens.treats/problems/forbidden",
  notFound: "https://chiens.treats/problems/not-found",
  conflict: "https://chiens.treats/problems/conflict",
  server: "https://chiens.treats/problems/server-error",
  rateLimited: "https://chiens.treats/problems/rate-limited",
  notImplemented: "https://chiens.treats/problems/not-implemented",
} as const;
