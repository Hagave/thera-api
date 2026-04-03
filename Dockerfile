# Stage 1: Base
FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json yarn.lock ./

# Stage 2: Development (com hot-reload)
FROM base AS development
ENV NODE_ENV=development
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn prisma generate
EXPOSE 3000
CMD ["yarn", "start:dev"]

# Stage 3: Builder
FROM base AS builder
ENV NODE_ENV=production
RUN yarn install --frozen-lockfile --production=false
COPY . .
RUN yarn prisma generate
RUN yarn build
RUN yarn install --frozen-lockfile --production=true

# Stage 4: Production
FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache libc6-compat dumb-init

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/src/infrastructure ./src/infrastructure

RUN addgroup -g 1001 nodejs && \
    adduser -S -u 1001 -G nodejs nestjs && \
    chown -R nestjs:nodejs /app

USER nestjs
EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main"]