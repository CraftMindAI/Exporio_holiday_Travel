import { after } from 'next/server';
import { removeUnusedImages } from '@/lib/media';
import { prisma } from '@/lib/prisma';
import { destinationFromRow } from '@/lib/data';
import { destinationInput, destinationNameTaken, isNotFound, isUniqueViolation, refreshSite } from '@/lib/adminInput';
import { adminRoute, fail, ok, readJson } from '@/lib/http';

type Params = { id: string };

/** PATCH /api/admin/destinations/:id */
export const PATCH = adminRoute<Params>(async (_admin, req, { params }) => {
  const { data, error } = destinationInput(await readJson(req), 'update');
  if (error) return fail(error);
  const { id } = await params;
  if (data!.name && (await destinationNameTaken(String(data!.name), id))) return fail(`A place named "${data!.name}" already exists.`, 409);
  const before = await prisma.destination.findUnique({ where: { id }, select: { imageUrl: true } });
  try {
    const destination = await prisma.destination.update({ where: { id }, data: data! });
    refreshSite();
    if (before && before.imageUrl !== destination.imageUrl) after(() => removeUnusedImages(before.imageUrl));
    return ok({ success: true, message: 'Destination updated successfully!', destination: destinationFromRow(destination) });
  } catch (err) {
    if (isNotFound(err)) return fail('Destination not found.', 404);
    if (isUniqueViolation(err)) return fail(`A place named "${data!.name}" already exists.`, 409);
    throw err;
  }
});

/** DELETE /api/admin/destinations/:id */
export const DELETE = adminRoute<Params>(async (_admin, _req, { params }) => {
  const { id } = await params;
  const before = await prisma.destination.findUnique({ where: { id }, select: { imageUrl: true } });
  try {
    await prisma.destination.delete({ where: { id } });
    refreshSite();
    if (before) after(() => removeUnusedImages(before.imageUrl));
    return ok({ success: true, message: 'Destination deleted successfully!' });
  } catch (err) {
    if (isNotFound(err)) return fail('Destination not found.', 404);
    throw err;
  }
});
