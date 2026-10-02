import { getAllBlogs } from '@/lib/data';
import { ok, route } from '@/lib/http';

export const dynamic = 'force-dynamic';

/** GET /api/blogs - database blogs plus the built-in posts. */
export const GET = route(async () => ok(await getAllBlogs()));
