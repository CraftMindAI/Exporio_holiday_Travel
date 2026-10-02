import { prisma } from '@/lib/prisma';
import { adminRoute, fail, ok } from '@/lib/http';

/** DELETE /api/admin/users/:id - delete a client account (and its sessions). Admin accounts can't be deleted here. */
export const DELETE = adminRoute<{ id: string }>(async (admin, _req, { params }) => {
  const { id } = await params;
  if (id === admin.id) return fail("You can't delete your own account.", 400);

  const user = await prisma.user.findUnique({ where: { id }, select: { role: true, name: true } });
  if (!user) return fail('User not found.', 404);
  if (user.role !== 'client') return fail('Admin accounts cannot be deleted from the dashboard.', 403);

  await prisma.user.delete({ where: { id } });
  return ok({ success: true, message: `${user.name} has been deleted.` });
});
