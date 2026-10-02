import { prisma } from '@/lib/prisma';
import { destinationFromRow, slugify } from '@/lib/data';
import { destinationInput, destinationNameTaken, isUniqueViolation, refreshSite, uniqueSlug } from '@/lib/adminInput';
import { adminRoute, fail, ok, readJson } from '@/lib/http';
import type { Prisma } from '@prisma/client';

/** POST /api/admin/destinations - add a destination / place. */
export const POST = adminRoute(async (_admin, req) => {
  const { data, error } = destinationInput(await readJson(req), 'create');
  if (error) return fail(error);
  if (await destinationNameTaken(String(data!.name))) return fail(`A place named "${data!.name}" already exists.`, 409);

  const slug = await uniqueSlug(slugify(String(data!.name)), async (s) => !!(await prisma.destination.findUnique({ where: { slug: s }, select: { id: true } })));
  let destination;
  try {
    destination = await prisma.destination.create({ data: { ...(data as Prisma.DestinationCreateInput), slug } });
  } catch (err) {
    if (isUniqueViolation(err)) return fail(`A place named "${data!.name}" already exists.`, 409);
    throw err;
  }
  refreshSite();
  return ok({ success: true, message: 'New place added successfully!', destination: destinationFromRow(destination) }, 201);
});
