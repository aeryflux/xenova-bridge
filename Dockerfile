# Xenova Bridge - Standalone NLP Service
# Provides intent classification and entity extraction via REST API

FROM node:20-slim AS base

# Install build dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy root package files for workspace resolution
COPY package*.json ./
COPY packages/xenova-bridge/package.json ./packages/xenova-bridge/

# Install dependencies (including devDependencies for build)
RUN npm install --workspace=@aeryflux/xenova-bridge --include-workspace-root

# Copy source files
COPY packages/xenova-bridge ./packages/xenova-bridge

# Build TypeScript
WORKDIR /app/packages/xenova-bridge
RUN npx tsc --outDir dist --declaration

# Production stage
FROM node:20-slim AS production

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy only production dependencies
COPY --from=base /app/package*.json ./
COPY --from=base /app/packages/xenova-bridge/package.json ./packages/xenova-bridge/

# Install production dependencies only
RUN npm install --workspace=@aeryflux/xenova-bridge --include-workspace-root --omit=dev

# Copy compiled JavaScript
COPY --from=base /app/packages/xenova-bridge/dist ./packages/xenova-bridge/dist

# Create cache directory for transformer models
ENV TRANSFORMERS_CACHE=/app/.cache
RUN mkdir -p /app/.cache && chown -R node:node /app/.cache

# Use non-root user
USER node

# Environment
ENV NODE_ENV=production
ENV PORT=3010

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3010/health || exit 1

EXPOSE 3010

# Start server
WORKDIR /app/packages/xenova-bridge
CMD ["node", "dist/server.js"]
