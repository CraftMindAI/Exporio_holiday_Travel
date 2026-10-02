import { getAllDestinations } from '@/lib/data';
import { ok, route } from '@/lib/http';

export const dynamic = 'force-dynamic';

/** GET /api/destinations - all destinations, A-Z. */
export const GET = route(async () => ok(await getAllDestinations()));
