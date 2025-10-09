import { ArgumentMetadata, Injectable, PipeTransform } from "@nestjs/common";
import type { ZodTypeAny } from "zod";
import { ZodValidationException } from "../errors/zod-validation.exception";

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodTypeAny) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new ZodValidationException(result.error, metadata.data);
    }
    return result.data;
  }
}
