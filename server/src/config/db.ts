import { PrismaClient } from '@prisma/client'
import { env } from './env'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: env.DATABASE_URL,
    log: env.IS_DEVELOPMENT ? ['error', 'warn'] : ['error'],
  })

if (!env.IS_PRODUCTION) globalForPrisma.prisma = prisma

