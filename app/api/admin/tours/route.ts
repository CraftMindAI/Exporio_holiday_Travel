import { prisma } from '@/lib/prisma';
import { slugify, tourFromRow } from '@/lib/data';
import { notifySubscribersAboutTour } from '@/lib/notify';
import { refreshSite, tourInput, uniqueSlug } from '@/lib/adminInput';
import { staffRoute, fail, ok, readJson } from '@/lib/http';
import type { Prisma } from '@prisma/client';

/** POST /api/admin/tours - publish a new tour package and email subscribers about it. */
export const POST = staffRoute(async (_admin, req) => {
  const body = await readJson(req);
  const { data, error } = await tourInput(body, 'create');
  if (error) return fail(error);

  const slug = await uniqueSlug(slugify(String(data!.title)), async (s) => !!(await prisma.tour.findUnique({ where: { slug: s }, select: { id: true } })));
  const tour = await prisma.tour.create({ data: { ...(data as Prisma.TourUncheckedCreateInput), slug } });
  refreshSite();

  // The tour is saved; a settings or mail problem must not make the publish look like it failed
  let notifyMessage: string;
  try {
    notifyMessage = (await notifySubscribersAboutTour(tour.id)).message;
  } catch (err) {
    console.error('[tours] subscriber notification failed:', err);
    notifyMessage = 'Subscribers could not be notified.';
  }
  return ok({ success: true, message: `New tour package published successfully! ${notifyMessage}`, tour: tourFromRow(tour) }, 201);
});
