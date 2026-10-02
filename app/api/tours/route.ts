import { getAllTours } from '@/lib/data';
import { ok, route } from '@/lib/http';

export const dynamic = 'force-dynamic';

/** GET /api/tours - all tour packages, newest first. */
export const GET = route(async () => ok(await getAllTours()));
