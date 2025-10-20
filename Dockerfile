# -------- build stage --------
FROM node:20-bookworm AS build
WORKDIR /app

# Install deps first for better cache hits
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# -------- runtime stage (standalone) --------
FROM node:20-bookworm-slim AS runner
WORKDIR /app

# Tools your services exec:
# - iproute2   -> `ip -j addr/route` (Network service)
# - procps     -> `ps` (Memory service)
# - curl       -> healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends \
    iproute2 procps curl ca-certificates \
 && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOST=0.0.0.0

# Copy standalone server output and static assets
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

# Expose for non-host networking scenarios (harmless with host mode)
EXPOSE 3000

# Run the standalone server
CMD ["sh","-lc","node -e 'process.env.HOST=\"0.0.0.0\"; process.env.HOSTNAME=\"0.0.0.0\"; require(\"./server.js\")'"]