# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
COPY apps/api ./apps/api
COPY packages ./packages
COPY tsconfig.json ./
COPY apps/api/tsconfig.json ./apps/api/
COPY apps/api/tsconfig.build.json ./apps/api/
COPY apps/api/vitest.config.ts ./apps/api/ 2>$null
COPY apps/api/prisma ./apps/api/prisma
RUN pnpm install --frozen-lockfile

FROM base AS build
RUN pnpm prisma generate
RUN pnpm api:build

FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY apps/api/prisma ./apps/api/prisma
COPY apps/api/.env.example ./apps/api/.env.example
CMD ["node", "apps/api/dist/main.js"]
