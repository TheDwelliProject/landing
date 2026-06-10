# syntax=docker/dockerfile:1.7

# Dependencies stage
FROM node:24.14.1-alpine AS deps
WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# Build stage
FROM node:24.14.1-alpine AS builder
WORKDIR /app

RUN corepack enable

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm run build

# Runtime stage
FROM node:24.14.1-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN addgroup --system --gid 1001 dwelli \
 && adduser --system --uid 1001 dwelli

COPY --from=builder /app/public ./public
COPY --from=builder --chown=dwelli:dwelli /app/.next/standalone ./
COPY --from=builder --chown=dwelli:dwelli /app/.next/static ./.next/static

USER dwelli

EXPOSE 3000

CMD ["node", "server.js"]
