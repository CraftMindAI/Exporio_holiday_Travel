import { prisma } from '@/lib/prisma';
import { isNotFound } from '@/lib/adminInput';
import { staffRoute, fail, ok } from '@/lib/http';

/** DELETE /api/admin/subscribers/:id - stop sending this person new-package emails. */
export const DELETE = staffRoute<{ id: string }>(async (_admin, _req, { params }) => {
  try {
    await prisma.subscriber.delete({ where: { id: (await params).id } });
    return ok({ success: true, message: 'Subscriber removed.' });
  } catch (err) {
    if (isNotFound(err)) return fail('Subscriber not found.', 404);
    throw err;
  }
});
