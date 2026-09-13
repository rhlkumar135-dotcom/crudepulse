FROM oven/bun:1 AS base
WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

ARG CACHE_BUST=1
COPY . .

# DATABASE_URL comes from Railway's PostgreSQL plugin env var
# No default — it MUST be set in Railway service variables

RUN bun x prisma generate
RUN bun run build

EXPOSE 3001

# Push schema to PostgreSQL, then start server
CMD ["sh", "-c", "bun x prisma db push 2>&1 && bun run start"]
