// The one shared PrismaClient for the whole app. Import `prisma` from here everywhere;
// never create a new PrismaClient elsewhere and never call prisma.$disconnect() per request.
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient();

// In development, Next.js hot reload re-imports modules; keep reusing the same client
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
