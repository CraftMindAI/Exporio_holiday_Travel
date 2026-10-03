import { employeeTemplate } from '@/lib/employees';
import { adminRoute } from '@/lib/http';

/** GET /api/admin/employees/template - Excel template for the employee import. Admin only. */
export const GET = adminRoute(async () => {
  const body = await employeeTemplate();
  return new Response(new Uint8Array(body), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="employees-template.xlsx"',
    },
  });
});
