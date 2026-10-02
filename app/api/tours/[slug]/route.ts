import { getTourForSlug } from '@/lib/data';
import { fail, ok, route, RouteContext } from '@/lib/http';

export const dynamic = 'force-dynamic';

/** GET /api/tours/:slug - one tour package. */
export const GET = route(async (_req: Request, { params }: RouteContext<{ slug: string }>) => {
  const tour = await getTourForSlug((await params).slug);
  return tour ? ok(tour) : fail('Tour not found', 404);
});
