import { Body, Controller, Get, Post, Req, Res } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { RefreshDto } from "./dto/refresh.dto";
import { Public } from "../common/decorators/public.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type { AuthUser } from "./auth.types";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ConfigService } from "@nestjs/config";
import ms from "ms";
import { JwtService } from "@nestjs/jwt";
import { VerifyRequestDto } from "./dto/verify-request.dto";
import { VerifyConfirmDto } from "./dto/verify-confirm.dto";

@Controller({ path: "auth" })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
  ) {}

  @Public()
  @Post("login")
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) reply: FastifyReply) {
    const { user, tokens } = await this.authService.login(dto);
    this.attachRefreshCookie(reply, tokens.refreshToken);
    return { user, accessToken: tokens.accessToken };
  }

  @Get("me")
  async me(@CurrentUser() user: AuthUser | undefined) {
    return { user };
  }

  @Public()
  @Post("refresh")
  async refresh(@Body() dto: RefreshDto, @Res({ passthrough: true }) reply: FastifyReply, @Req() req: FastifyRequest) {
    const token = dto.refreshToken ?? (req as any).cookies?.refreshToken;
    if (!token) {
      return { user: undefined, accessToken: undefined };
    }
    const payload = this.jwt.decode(token) as (AuthUser & { sub: string }) | null;
    if (!payload) {
      return { user: undefined, accessToken: undefined };
    }
    const authUser: AuthUser = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      emailVerifiedAt: payload.emailVerifiedAt ?? null,
    };
    const { tokens } = await this.authService.refresh(authUser, { refreshToken: token });
    this.attachRefreshCookie(reply, tokens.refreshToken);
    return { user: authUser, accessToken: tokens.accessToken };
  }

  @Post("logout")
  async logout(@CurrentUser() user: AuthUser | undefined, @Res({ passthrough: true }) reply: FastifyReply) {
    if (user) {
      await this.authService.logout(user.id);
    }
    reply.clearCookie("refreshToken", { path: "/" });
    return { success: true };
  }

  @Public()
  @Post("register")
  async register(@Body() dto: RegisterDto, @CurrentUser() actor: AuthUser | undefined) {
    const user = await this.authService.register(dto, actor);
    return { user };
  }

  @Public()
  @Post("verify/request")
  async requestVerification(@Body() dto: VerifyRequestDto) {
    await this.authService.requestVerification(dto.email);
    return { success: true };
  }

  @Public()
  @Post("verify/confirm")
  async confirmVerification(@Body() dto: VerifyConfirmDto) {
    const user = await this.authService.verifyEmail(dto.token);
    return { user };
  }

  private attachRefreshCookie(reply: FastifyReply, token?: string) {
    if (!token) {
      return;
    }
    const ttl = this.config.get<string>("app.jwt.refreshTokenTtl") ?? "30d";
    const maxAgeSeconds = Math.floor(ms(ttl) / 1000);
    const isProd = this.config.get<boolean>("app.isProduction");
    reply.setCookie("refreshToken", token, {
      httpOnly: true,
      path: "/api/v1/auth/refresh",
      maxAge: maxAgeSeconds,
      sameSite: "lax",
      secure: Boolean(isProd),
    });
  }
}
