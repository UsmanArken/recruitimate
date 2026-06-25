FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

RUN npm install --prefer-offline

# Copy source
COPY . .

# FASTAPI_URL must be set at build time so Next.js rewrites point to the api service
ARG FASTAPI_URL=http://api:8000
ENV FASTAPI_URL=$FASTAPI_URL

RUN npm run build

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy built output from builder
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
