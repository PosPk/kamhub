# syntax=docker/dockerfile:1

# -------- Builder --------
FROM node:20-slim AS builder
WORKDIR /app
ENV NODE_ENV=production

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --include=dev

# Copy source
COPY . .

# Build Next.js (standalone output)
RUN npm run build

# -------- Runtime --------
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Copy standalone server and static assets
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/app ./app
COPY --from=builder /app/public ./public 2>/dev/null || true

EXPOSE 3000

CMD ["node", "server.js"]
