# Stage 1: Dependencies
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Builder
FROM node:22-alpine AS builder
WORKDIR /app

# NEXT_PUBLIC_ env vars must be set at build time for Next.js to inline them
# These are safe to expose as they are public keys
ENV NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoiZHlsYW5uMjUiLCJhIjoiY203NXpiY3hiMDFmYjJrb3ZtZGthM2JrOCJ9.s9MOjhoCK3EaUp9IOpyCbw

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 3: Runner (Production)
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy public assets (must be done after standalone copy)
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

# Cloud Run expects the container to listen on PORT environment variable
EXPOSE 8080
ENV PORT 8080
ENV HOSTNAME "0.0.0.0"

# Start the application
CMD ["node", "server.js"]
