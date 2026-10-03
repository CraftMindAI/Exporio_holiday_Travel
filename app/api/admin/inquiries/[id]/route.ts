import { InquiryStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { isNotFound } from '@/lib/adminInput';
import { staffRoute, fail, ok, readJson } from '@/lib/http';

type Params = { id: string };
const STATUSES = Object.values(InquiryStatus) as string[];

/** PATCH /api/admin/inquiries/:id - change a lead's status. */
export const PATCH = staffRoute<Params>(async (_admin, req, { params }) => {
  const status = String((await readJson(req)).status ?? '');
  if (!STATUSES.includes(status)) return fail('Invalid status.');
  try {
    await prisma.inquiry.update({ where: { id: (await params).id }, data: { status: status as InquiryStatus } });
    return ok({ success: true, message: 'Status updated.' });
  } catch (err) {
    if (isNotFound(err)) return fail('Inquiry not found.', 404);
    throw err;
  }
});

/** DELETE /api/admin/inquiries/:id */
export const DELETE = staffRoute<Params>(async (_admin, _req, { params }) => {
  try {
    await prisma.inquiry.delete({ where: { id: (await params).id } });
    return ok({ success: true, message: 'Inquiry deleted.' });
  } catch (err) {
    if (isNotFound(err)) return fail('Inquiry not found.', 404);
    throw err;
  }
});
