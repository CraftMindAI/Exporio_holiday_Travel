import { prisma } from '@/lib/prisma';
import { checkEmployee, createEmployee, existingEmails } from '@/lib/employees';
import { adminRoute, fail, ok, readJson } from '@/lib/http';

export const dynamic = 'force-dynamic';

/** GET /api/admin/employees - employee accounts (admins are not listed). Admin only. */
export const GET = adminRoute(async () => {
  const rows = await prisma.user.findMany({
    where: { role: 'employee' },
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, email: true, phone: true, employeeCode: true, location: true, role: true, createdAt: true },
  });
  return ok(
    rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      phone: r.phone,
      employee_code: r.employeeCode,
      location: r.location,
      role: r.role,
      created_at: r.createdAt.toISOString(),
    })),
  );
});

/** POST /api/admin/employees - add one employee from the manual form. Admin only. */
export const POST = adminRoute(async (_admin, req) => {
  const { data, errors } = checkEmployee(await readJson(req));
  if (!data) return fail(errors.join('. ') + '.');
  if ((await existingEmails([data.email])).size) return fail('An account with this email already exists.', 409);

  const created = await createEmployee(data);
  return ok(
    {
      success: true,
      message: created.emailed
        ? `${data.name} (${created.employeeCode}) was added and their login details were emailed to ${data.email}.`
        : `${data.name} (${created.employeeCode}) was added, but the welcome email could not be sent.`,
      employee: created,
    },
    201,
  );
});
