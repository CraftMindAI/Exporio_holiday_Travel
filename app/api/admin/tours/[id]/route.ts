import { after } from 'next/server';
import { removeUnusedImages } from '@/lib/media';
import { prisma } from '@/lib/prisma';
import { tourFromRow } from '@/lib/data';
import { isNotFound, refreshSite, tourInput } from '@/lib/adminInput';
import { staffRoute, fail, ok, readJson } from '@/lib/http';

type Params = { id: string };

/** PATCH /api/admin/tours/:id - update a tour package. */
export const PATCH = staffRoute<Params>(async (_admin, req, { params }) => {
  const { data, error } = await tourInput(await readJson(req), 'update');
  if (error) return fail(error);
  const { id } = await params;
  const before = await prisma.tour.findUnique({ where: { id }, select: { imageUrl: true } });
  try {
    const tour = await prisma.tour.update({ where: { id }, data: data! });
    refreshSite();
    // A replaced cover image is no longer needed on FTP
    if (before && before.imageUrl !== tour.imageUrl) after(() => removeUnusedImages(before.imageUrl));
    return ok({ success: true, message: 'Tour package updated successfully!', tour: tourFromRow(tour) });
  } catch (err) {
    if (isNotFound(err)) return fail('Tour not found.', 404);
    throw err;
  }
});

/** DELETE /api/admin/tours/:id - delete a tour package (its inquiries are kept, unlinked). */
export const DELETE = staffRoute<Params>(async (_admin, _req, { params }) => {
  const { id } = await params;
  const images = await prisma.tour.findUnique({ where: { id }, select: { imageUrl: true, placesVisit: { select: { imageUrl: true } } } });
  try {
    await prisma.tour.delete({ where: { id } });
    refreshSite();
    // Remove the cover (and its day-stop images, deleted with the tour) from FTP
    if (images) after(() => removeUnusedImages(images.imageUrl, ...images.placesVisit.map((p) => p.imageUrl)));
    return ok({ success: true, message: 'Tour package deleted successfully!' });
  } catch (err) {
    if (isNotFound(err)) return fail('Tour not found.', 404);
    throw err;
  }
});
