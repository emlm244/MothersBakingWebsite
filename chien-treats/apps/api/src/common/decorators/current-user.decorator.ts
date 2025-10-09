import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { AuthUser } from "../../auth/auth.types";

export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext): AuthUser | undefined => {
  const request = ctx.switchToHttp().getRequest();
  return request.user as AuthUser | undefined;
});