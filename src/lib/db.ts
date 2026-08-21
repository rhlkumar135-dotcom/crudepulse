// SPDX-License-Identifier: Apache-2.0
// Copyright (C) 2026 Shogo Technologies, Inc.
import { PrismaClient } from '../generated/prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const url = process.env.DATABASE_URL
  if (url && url.startsWith('postgresql://')) {
    // For PostgreSQL in production
    const { PrismaPg } = require('@prisma/adapter-pg') as typeof import('@prisma/adapter-pg')
    const adapter = new PrismaPg({ connectionString: url })
    return new PrismaClient({ adapter } as any)
  }
  if (url && url.startsWith('file:')) {
    // For SQLite in development
    const { PrismaLibSql } = require('@prisma/adapter-libsql') as typeof import('@prisma/adapter-libsql')
    const adapter = new PrismaLibSql({ url })
    return new PrismaClient({ adapter } as any)
  }
  return new PrismaClient() as any
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
