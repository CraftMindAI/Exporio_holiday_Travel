import { prisma } from '@/lib/prisma';
import { ok } from '@/lib/http';

export const dynamic = 'force-dynamic';

/** GET /api/health - checks the app can reach the MySQL database. */
export async function GET() {
  const started = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return ok({ status: 'ok', database: 'connected', latencyMs: Date.now() - started });
  } catch (err) {
    console.error('[health] database check failed:', err);
    return ok({ status: 'error', database: 'unreachable' }, 503);
  }
}
