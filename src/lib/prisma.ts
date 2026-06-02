import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  // Database URL .env se uthayen
  const connectionString = process.env.DATABASE_URL

  // Connection pool banayen
  const pool = new Pool({ connectionString })

  // Prisma ko us pool k sath jor dein
  const adapter = new PrismaPg(pool)

  // Ab PrismaClient ko adapter pass karein
  return new PrismaClient({ adapter })
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma