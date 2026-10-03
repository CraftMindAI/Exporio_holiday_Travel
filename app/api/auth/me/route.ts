import { adminProfilePath, getStaffUser, toPublicUser } from '@/lib/auth';
import { ok, route } from '@/lib/http';

export const dynamic = 'force-dynamic';

/** GET /api/auth/me - the signed-in staff member (or null) and their dashboard URL. */
export const GET = route(async () => {
  const user = await getStaffUser();
  if (!user) return ok({ user: null });
  return ok({ user: toPublicUser(user), adminPath: adminProfilePath(user.id) });
});
