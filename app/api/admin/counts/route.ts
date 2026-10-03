import { prisma } from '@/lib/prisma';
import { staffRoute, ok } from '@/lib/http';

export const dynamic = 'force-dynamic';

/** GET /api/admin/counts - content totals for the dashboard. */
export const GET = staffRoute(async () => {
  const [tours, destinations, blogs] = await Promise.all([prisma.tour.count(), prisma.destination.count(), prisma.blog.count()]);
  return ok({ tours, destinations, blogs });
});
