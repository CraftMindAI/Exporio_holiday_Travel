import { prisma } from '@/lib/prisma';
import { adminRoute, ok } from '@/lib/http';

export const dynamic = 'force-dynamic';

/** GET /api/admin/inquiries - all booking inquiries, newest first. */
export const GET = adminRoute(async () => {
  const rows = await prisma.inquiry.findMany({ orderBy: { createdAt: 'desc' } });
  return ok(
    rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email || null,
      phone: r.phone,
      tour_title: r.tourTitle,
      travel_date: r.travelDate ? r.travelDate.toISOString().slice(0, 10) : null,
      guests_count: r.guestsCount,
      message: r.message,
      status: r.status,
      created_at: r.createdAt.toISOString(),
    })),
  );
});
