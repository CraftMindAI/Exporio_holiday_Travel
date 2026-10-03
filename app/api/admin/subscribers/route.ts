import { prisma } from '@/lib/prisma';
import { staffRoute, ok } from '@/lib/http';

export const dynamic = 'force-dynamic';

/** GET /api/admin/subscribers - newest first. */
export const GET = staffRoute(async () => {
  const rows = await prisma.subscriber.findMany({ orderBy: { subscribedAt: 'desc' } });
  return ok(
    rows.map((r) => ({
      id: r.id,
      email: r.email,
      name: r.name,
      phone: r.phone,
      location: r.location,
      subscribed_at: r.subscribedAt.toISOString(),
    })),
  );
});
