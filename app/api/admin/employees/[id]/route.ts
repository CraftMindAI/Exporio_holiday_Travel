import { prisma } from '@/lib/prisma';
import { adminRoute, fail, ok } from '@/lib/http';

/** DELETE /api/admin/employees/:id - remove an employee (signs them out everywhere). Admins can't be removed here. */
export const DELETE = adminRoute<{ id: string }>(async (admin, _req, { params }) => {
  const { id } = await params;
  if (id === admin.id) return fail("You can't delete your own account.", 400);

  const user = await prisma.user.findUnique({ where: { id }, select: { role: true, name: true } });
  if (!user) return fail('Employee not found.', 404);
  if (user.role !== 'employee') return fail('Admin accounts cannot be removed from the dashboard.', 403);

  await prisma.user.delete({ where: { id } });
  return ok({ success: true, message: `${user.name} has been removed.` });
});
