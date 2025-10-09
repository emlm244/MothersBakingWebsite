import { Injectable, UnauthorizedException, ConflictException, Logger, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { ProblemException, problemTypes } from "../common/errors/problem-details";
import * as argon2 from "argon2";
import { randomBytes } from "crypto";
import ms from "ms";
import type { AuthTokens, AuthUser } from "./auth.types";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import type { Role } from "@prisma/client";
import { MailerService } from "../mailer/mailer.service";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly mailer: MailerService,
  ) {}

  async register(dto: RegisterDto, actor?: AuthUser) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException("Email already registered");
    }

    const role = actor ? dto.role ?? "customer" : "customer";

    if (actor && !this.canAssignRole(actor.role, role)) {
      throw new ProblemException({
        type: problemTypes.forbidden,
        title: "Cannot assign role",
        status: 403,
        detail: "You are not allowed to assign the requested role.",
      });
    }

    const passwordHash = await argon2.hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash,
        role,
      },
    });

    await this.issueVerificationToken(user);

    return this.toAuthUser(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const passwordValid = await argon2.verify(user.passwordHash, dto.password);
    if (!passwordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    if (!user.emailVerifiedAt) {
      await this.ensureActiveVerification(user);
      throw new UnauthorizedException("Email not verified. Please check your inbox for the verification link.");
    }

    await this.prisma.refreshToken.deleteMany({ where: { userId: user.id } });

    const authUser = this.toAuthUser(user);
    const tokens = await this.issueTokens(authUser);

    return { user: authUser, tokens };
  }

  async refresh(user: AuthUser, dto: { refreshToken?: string }) {
    if (!user.emailVerifiedAt) {
      throw new UnauthorizedException("Email not verified");
    }

    const tokenRecord = await this.prisma.refreshToken.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    if (!tokenRecord) {
      throw new UnauthorizedException("No refresh token");
    }

    if (tokenRecord.expiresAt < new Date()) {
      await this.prisma.refreshToken.delete({ where: { id: tokenRecord.id } });
      throw new UnauthorizedException("Refresh token expired");
    }

    const providedRefresh = dto.refreshToken;
    if (!providedRefresh) {
      throw new UnauthorizedException("Refresh token missing");
    }

    const matches = await argon2.verify(tokenRecord.token, providedRefresh);
    if (!matches) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    await this.prisma.refreshToken.delete({ where: { id: tokenRecord.id } });

    const tokens = await this.issueTokens(user);
    return { user, tokens };
  }

  async logout(userId: string) {
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
  }

  async requestVerification(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || user.emailVerifiedAt) {
      return;
    }
    await this.issueVerificationToken(user);
  }

  async verifyEmail(token: string) {
    const record = await this.prisma.emailVerificationToken.findFirst({
      where: { token },
      include: { user: true },
    });
    if (!record) {
      throw new BadRequestException("Verification token is invalid or has already been used.");
    }
    if (record.usedAt) {
      throw new BadRequestException("Verification token has already been used.");
    }
    if (record.expiresAt < new Date()) {
      await this.prisma.emailVerificationToken.delete({ where: { id: record.id } });
      throw new BadRequestException("Verification token has expired.");
    }

    const user = await this.prisma.user.update({
      where: { id: record.userId },
      data: {
        emailVerifiedAt: new Date(),
      },
    });

    await this.prisma.emailVerificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });

    await this.prisma.emailVerificationToken.deleteMany({
      where: { userId: record.userId, id: { not: record.id } },
    });

    return this.toAuthUser(user);
  }

  private async ensureActiveVerification(user: { id: string; email: string; name: string }) {
    const active = await this.prisma.emailVerificationToken.findFirst({
      where: {
        userId: user.id,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
    if (active) {
      return;
    }
    await this.issueVerificationToken(user);
  }

  private async issueVerificationToken(user: { id: string; email: string; name: string }) {
    await this.prisma.emailVerificationToken.deleteMany({
      where: { userId: user.id, usedAt: null },
    });

    const token = randomBytes(32).toString("base64url");
    const ttl = this.config.get<string>("app.auth.emailVerificationTtl") ?? "24h";
    const expiresAt = new Date(Date.now() + this.parseDuration(ttl));

    await this.prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    const origin = this.config.get<string>("app.frontendOrigin") ?? "http://localhost:3000";
    const verifyUrl = new URL("/verify-email", origin);
    verifyUrl.searchParams.set("token", token);

    await this.mailer.sendEmailVerification({
      to: user.email,
      name: user.name,
      verificationUrl: verifyUrl.toString(),
    });
  }

  private async issueTokens(user: AuthUser): Promise<AuthTokens> {
    const payload = {
      id: user.id,
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerifiedAt: user.emailVerifiedAt ?? null,
    } satisfies AuthUser & { sub: string };

    const accessTokenTtl = this.config.get<string>("app.jwt.accessTokenTtl") ?? "1h";
    const refreshTokenTtl = this.config.get<string>("app.jwt.refreshTokenTtl") ?? "30d";

    const accessToken = await this.jwt.signAsync(payload, {
      expiresIn: accessTokenTtl,
    });

    const refreshToken = randomBytes(48).toString("base64url");
    const hashedRefresh = await argon2.hash(refreshToken);
    const refreshExpiresAt = new Date(Date.now() + this.parseDuration(refreshTokenTtl));

    await this.prisma.refreshToken.create({
      data: {
        token: hashedRefresh,
        userId: user.id,
        expiresAt: refreshExpiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  private parseDuration(value: string) {
    const duration = ms(value);
    if (typeof duration !== "number" || Number.isNaN(duration)) {
      this.logger.warn(`Unable to parse duration '${value}', defaulting to 1 hour`);
      return ms("1h");
    }
    return duration;
  }

  private toAuthUser(user: { id: string; email: string; name: string; role: Role; emailVerifiedAt: Date | null }): AuthUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerifiedAt: user.emailVerifiedAt ? user.emailVerifiedAt.toISOString() : null,
    };
  }

  private canAssignRole(actorRole: Role, requested: Role) {
    if (actorRole === "admin") {
      return true;
    }
    if (actorRole === "staff" && requested === "staff") {
      return true;
    }
    return requested === "customer";
  }
}
