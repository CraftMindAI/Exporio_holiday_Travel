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

export type ClientRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  email_verified: boolean;
  created_at: string;
};

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

/** Website signups (role 'client'). */
export const fetchClients = () => apiFetch<ClientRow[]>('/api/admin/users');

/** Permanently delete a client account. */
export function deleteClient(id: string): Promise<Result> {
  return asResult(apiFetch(`/api/admin/users/${id}`, { method: 'DELETE' }));
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
