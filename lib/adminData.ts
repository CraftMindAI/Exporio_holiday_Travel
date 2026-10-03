// Browser-side data access for the admin dashboard, backed by /api/admin/* (admin session required).
import { apiFetch, asResult, Result } from '@/lib/api';

export type InquiryStatus = 'pending' | 'contacted' | 'confirmed' | 'cancelled';
export const INQUIRY_STATUSES: InquiryStatus[] = ['pending', 'contacted', 'confirmed', 'cancelled'];

export type InquiryRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  tour_title: string | null;
  travel_date: string | null;
  guests_count: number | null;
  message: string | null;
  status: InquiryStatus | null;
  created_at: string;
};

export type SubscriberRow = {
  id: string;
  email: string;
  name?: string | null;
  phone?: string | null;
  location?: string | null;
  subscribed_at: string;
};

export type StaffRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  employee_code: string | null;
  location: string | null;
  role: 'admin' | 'employee';
  created_at: string;
};

export type ImportCheck = { row: number; name: string; email: string; phone: string; location: string; errors: string[] };
export type CreatedEmployee = { email: string; name: string; employeeCode: string; emailed: boolean; tempPassword?: string };

export const fetchInquiries = () => apiFetch<InquiryRow[]>('/api/admin/inquiries');

export function updateInquiryStatus(id: string, status: InquiryStatus): Promise<Result> {
  return asResult(apiFetch(`/api/admin/inquiries/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }));
}

export function deleteInquiryRow(id: string): Promise<Result> {
  return asResult(apiFetch(`/api/admin/inquiries/${id}`, { method: 'DELETE' }));
}

export const fetchSubscribers = () => apiFetch<SubscriberRow[]>('/api/admin/subscribers');

export function deleteSubscriber(id: string): Promise<Result> {
  return asResult(apiFetch(`/api/admin/subscribers/${id}`, { method: 'DELETE' }));
}

/** Employee accounts (admins are not listed). Admin only. */
export const fetchEmployees = () => apiFetch<StaffRow[]>('/api/admin/employees');

/** Add one employee from the manual form. Admin only. */
export async function addEmployee(input: { name: string; email: string; phone: string; location: string }): Promise<Result & { employee?: CreatedEmployee }> {
  try {
    const data = await apiFetch<{ message: string; employee: CreatedEmployee }>('/api/admin/employees', { method: 'POST', body: JSON.stringify(input) });
    return { success: true, message: data.message, employee: data.employee };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Could not add the employee.' };
  }
}

/** Validate (preview) or import an Excel/CSV file of employees. Admin only. */
export async function importEmployees(file: File, mode: 'preview' | 'import') {
  const form = new FormData();
  form.append('file', file);
  return apiFetch<{ message?: string; checks: ImportCheck[]; validCount?: number; created?: CreatedEmployee[] }>(
    `/api/admin/employees/import?mode=${mode}`,
    { method: 'POST', body: form },
  );
}

export type PasswordReset = { email: string; name: string; emailed: boolean; tempPassword?: string };

/** Set a new generated password for an employee (emailed to them). Admin only. */
export async function resetEmployeePassword(id: string): Promise<Result & { reset?: PasswordReset }> {
  try {
    const data = await apiFetch<{ message: string; reset: PasswordReset }>(`/api/admin/employees/${id}/reset-password`, { method: 'POST' });
    return { success: true, message: data.message, reset: data.reset };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Could not reset the password.' };
  }
}

/** Remove an employee. Admin only. */
export function deleteEmployee(id: string): Promise<Result> {
  return asResult(apiFetch(`/api/admin/employees/${id}`, { method: 'DELETE' }));
}

export type AppSettings = { customerNotifications: boolean };

export const fetchSettings = () => apiFetch<AppSettings>('/api/admin/settings');

export async function saveSettings(changes: Partial<AppSettings>): Promise<Result & { settings?: AppSettings }> {
  try {
    const data = await apiFetch<{ message: string; settings: AppSettings }>('/api/admin/settings', { method: 'PATCH', body: JSON.stringify(changes) });
    return { success: true, message: data.message, settings: data.settings };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Could not save settings.' };
  }
}

export async function countRows(table: 'tours' | 'destinations' | 'blogs'): Promise<number> {
  return (await apiFetch<Record<typeof table, number>>('/api/admin/counts'))[table];
}
