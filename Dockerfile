FROM oven/bun:1 AS base
WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

COPY . .

# Dummy URL for prisma generate only (does NOT connect)
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

RUN bun x prisma generate
RUN bun run build

EXPOSE 3001

# At runtime, DATABASE_URL is set by Railway's Postgres service
# Run db push to create tables, then start the server
CMD ["sh", "-c", "bun x prisma db push --accept-data-loss 2>/dev/null; bun run start"]
