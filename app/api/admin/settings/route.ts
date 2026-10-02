import { getSettings, updateSettings } from '@/lib/settings';
import { adminRoute, ok, readJson } from '@/lib/http';

export const dynamic = 'force-dynamic';

/** GET /api/admin/settings - advanced site settings. */
export const GET = adminRoute(async () => ok(await getSettings()));

/** PATCH /api/admin/settings - change one or more settings, e.g. { customerNotifications: false }. */
export const PATCH = adminRoute(async (_admin, req) => {
  const settings = await updateSettings(await readJson(req));
  return ok({ success: true, message: 'Settings saved.', settings });
});
