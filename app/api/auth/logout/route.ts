import { destroySession } from '@/lib/auth';
import { ok, route } from '@/lib/http';

/** POST /api/auth/logout - end this browser's session. */
export const POST = route(async () => {
  await destroySession();
  return ok({ success: true });
});
