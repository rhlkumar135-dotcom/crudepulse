FROM oven/bun:1 AS base
WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

ARG CACHE_BUST=1
COPY . .

# Use SQLite for production — schema provider is sqlite
ENV DATABASE_URL="file:./prisma/prod.db"

RUN bun x prisma generate
RUN bun run build

EXPOSE 3001

# Run db push with SQLite URL explicitly, then start the server
CMD ["sh", "-c", "DATABASE_URL='file:./prisma/prod.db' bun x prisma db push 2>&1; bun run start"]
