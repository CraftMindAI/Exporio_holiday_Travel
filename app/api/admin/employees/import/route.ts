import { checkEmployeeRows, createEmployees, readEmployeeFile } from '@/lib/employees';
import { adminRoute, fail, ok } from '@/lib/http';

const MAX_FILE_BYTES = 2 * 1024 * 1024;

/**
 * POST /api/admin/employees/import?mode=preview|import (multipart, field "file": .xlsx or .csv)
 *   preview - validate every row and report problems, nothing is saved
 *   import  - create every valid row (rows with problems are skipped) and email login details
 */
export const POST = adminRoute(async (_admin, req) => {
  const mode = new URL(req.url).searchParams.get('mode') === 'import' ? 'import' : 'preview';
  const form = await req.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File)) return fail('Choose an Excel or CSV file to upload.');
  if (file.size > MAX_FILE_BYTES) return fail('File is too large (max 2 MB).');

  const { rows, error } = await readEmployeeFile(file.name, Buffer.from(await file.arrayBuffer()));
  if (error) return fail(error);
  if (!rows.length) return fail('No employee rows found under the header row.');

  const { checks, valid } = await checkEmployeeRows(rows);
  if (mode === 'preview') return ok({ success: true, checks, validCount: valid.length });

  const created = await createEmployees(valid);
  const skipped = checks.length - valid.length;
  return ok({
    success: true,
    message: `Added ${created.length} employee${created.length === 1 ? '' : 's'}${skipped ? `, skipped ${skipped} row${skipped === 1 ? '' : 's'} with problems` : ''}.`,
    created,
    checks,
  });
});
