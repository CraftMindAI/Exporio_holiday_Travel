import { prisma } from '@/lib/prisma';
import { resetEmployeePassword } from '@/lib/employees';
import { adminRoute, fail, ok } from '@/lib/http';

/** POST /api/admin/employees/:id/reset-password - set a new generated password for an employee and email it. Admin only. */
export const POST = adminRoute<{ id: string }>(async (_admin, _req, { params }) => {
  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id }, select: { role: true } });
  if (!user) return fail('Employee not found.', 404);
  if (user.role !== 'employee') return fail('Only employee passwords can be reset here.', 403);

  const reset = await resetEmployeePassword(id);
  return ok({
    success: true,
    message: reset.emailed
      ? `Password reset. The new password was emailed to ${reset.email}.`
      : 'Password reset, but the email could not be sent. Share the new password yourself.',
    reset,
  });
});
