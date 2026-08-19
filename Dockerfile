FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Copy source
COPY . .

# Set a dummy DATABASE_URL for Prisma generate (doesn't connect, just generates client)
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

# Generate Prisma client for PostgreSQL
RUN bun x prisma generate

# Build frontend
RUN bun run build

# Start server
EXPOSE 3001
CMD ["bun", "run", "start"]
