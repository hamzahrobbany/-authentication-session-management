// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client"

declare global {
  // prevent multiple instances during dev hot-reload
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

const prisma = globalThis.prisma || new PrismaClient()
if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma

export default prisma
