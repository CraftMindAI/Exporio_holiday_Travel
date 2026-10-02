import { adminProfilePath, getSessionUser, toPublicUser } from '@/lib/auth';
import { ok, route } from '@/lib/http';

export const dynamic = 'force-dynamic';

/** GET /api/auth/me - the signed-in user (or null), plus the dashboard URL for admins. */
export const GET = route(async () => {
  const user = await getSessionUser();
  if (!user) return ok({ user: null });
  return ok({ user: toPublicUser(user), adminPath: user.role === 'admin' ? adminProfilePath(user.id) : undefined });
});
