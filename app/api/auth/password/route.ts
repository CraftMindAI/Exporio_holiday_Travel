import { prisma } from '@/lib/prisma';
import { getSessionUser, hashPassword, revokeOtherSessions, verifyPassword } from '@/lib/auth';
import { fail, ok, readJson, route } from '@/lib/http';

/** POST /api/auth/password - change password (requires the current one). Signs out other devices. */
export const POST = route(async (req: Request) => {
  const user = await getSessionUser();
  if (!user) return fail('Please sign in.', 401);

  const body = await readJson(req);
  const currentPassword = String(body.currentPassword ?? '');
  const newPassword = String(body.newPassword ?? '');

  if (!(await verifyPassword(currentPassword, user.password))) return fail('Current password is incorrect.');
  if (newPassword.length < 8 || newPassword.length > 200) return fail('New password must be at least 8 characters.');
  if (await verifyPassword(newPassword, user.password)) return fail('New password must be different from the current password.');

  await prisma.user.update({ where: { id: user.id }, data: { password: await hashPassword(newPassword) } });
  await revokeOtherSessions(user.id);
  return ok({ success: true, message: 'Password changed successfully. Other devices have been signed out.' });
});
