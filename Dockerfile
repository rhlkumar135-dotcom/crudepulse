FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Copy source
COPY . .

# Generate Prisma client
RUN bun x prisma generate

# Build frontend
RUN bun run build

# Start server
EXPOSE 3001
CMD ["bun", "run", "start"]
