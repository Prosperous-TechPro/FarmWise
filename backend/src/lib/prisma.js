import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

export const prisma = globalForPrisma.__farmwisePrisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__farmwisePrisma = prisma;
}

export default prisma;
