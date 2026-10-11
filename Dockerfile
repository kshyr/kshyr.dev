# syntax=docker/dockerfile:1

FROM node:24-bookworm-slim AS base
ENV ASTRO_TELEMETRY_DISABLED=1 \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml ./

FROM base AS build
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile
COPY . .
ARG SITE_URL=https://kshyr.dev
ENV SITE_URL=$SITE_URL
RUN pnpm build

# The standalone server loads its dependencies from node_modules at runtime.
FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --prod

FROM node:24-bookworm-slim AS runner
ENV NODE_ENV=production \
    ASTRO_TELEMETRY_DISABLED=1 \
    HOST=0.0.0.0 \
    PORT=3000
WORKDIR /app
RUN groupadd --system --gid 1001 astro \
    && useradd --system --uid 1001 --gid astro --no-create-home astro
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
USER astro
EXPOSE 3000
CMD ["node", "./dist/server/entry.mjs"]
