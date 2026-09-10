FROM oven/bun:1 AS base
WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

ARG CACHE_BUST=2
COPY . .

# Build-time placeholder for prisma generate (doesn't connect, just validates URL format)
# At runtime, Railway injects the real DATABASE_URL from the Postgres plugin
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"

RUN bun x prisma generate
RUN bun run build

EXPOSE 3001

# Runtime: use the DATABASE_URL injected by Railway (Postgres plugin)
CMD ["sh", "-c", "bun x prisma db push 2>&1 && PORT=${PORT:-3001} bun run server.tsx"]
