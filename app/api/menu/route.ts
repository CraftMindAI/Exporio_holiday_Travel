import { getMenu } from '@/lib/data';
import { ok, route } from '@/lib/http';

export const dynamic = 'force-dynamic';

/** GET /api/menu - header navigation: places (Tour menu) and, per place, its tour packages (Place To Visit menu). */
export const GET = route(async () => ok(await getMenu()));
