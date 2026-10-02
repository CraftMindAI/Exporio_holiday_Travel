import { prisma } from '@/lib/prisma';
import { adminRoute, ok } from '@/lib/http';

export const dynamic = 'force-dynamic';

/** GET /api/admin/users - website signups (role client). Password hashes are never returned. */
export const GET = adminRoute(async () => {
  const rows = await prisma.user.findMany({
    where: { role: 'client' },
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, email: true, phone: true, role: true, emailVerifiedAt: true, createdAt: true },
  });
  return ok(
    rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      phone: r.phone,
      role: r.role,
      email_verified: !!r.emailVerifiedAt,
      created_at: r.createdAt.toISOString(),
    })),
  );
});
