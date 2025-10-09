import { HttpStatus } from "@nestjs/common";
import type { ZodError } from "zod";
import { ProblemException, problemTypes } from "./problem-details";

export class ZodValidationException extends ProblemException {
  constructor(error: ZodError, instance?: string) {
    super({
      type: problemTypes.validation,
      title: "Validation failed",
      status: HttpStatus.BAD_REQUEST,
      detail: "One or more validation errors occurred.",
      instance,
      errors: error.issues.map((issue) => ({
        field: [...issue.path].join("."),
        message: issue.message,
      })),
    });
  }
}
