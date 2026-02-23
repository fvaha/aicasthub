# Backend Dockerfile — optimizirano za caching
FROM node:20-alpine AS deps

# Instaliraj native build toolove (cachira se zasebno)
RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

# Kopiraj SAMO package fajlove — npm install se cachira dok se oni ne promijene
COPY package*.json ./
RUN npm install --frozen-lockfile

# ─── Build stage ───────────────────────────────────────────────────────────────
FROM deps AS builder

WORKDIR /app

# Kopiraj node_modules iz deps stagea (već cachovano)
COPY --from=deps /app/node_modules ./node_modules

# Kopiraj ostatak source koda
COPY . .

RUN npx medusa build

# ─── Production stage ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Kopiraj samo ono što treba za runtime
COPY --from=builder /app/.medusa ./.medusa
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

EXPOSE 9009

CMD ["npx", "medusa", "start", "--port", "9009"]
