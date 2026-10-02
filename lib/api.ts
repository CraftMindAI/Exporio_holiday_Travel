// Browser-side client for the app's API routes (app/api/*). Replaces the old Supabase client:
// components call these functions; the database is only ever touched on the server via Prisma.
import { TourPackage, Inquiry, Destination, Blog } from '@/types';

export type Result = { success: boolean; message: string };

/** `/api/x?y` -> `/api/x/?y`, matching `trailingSlash: true` so requests aren't redirected. */
function withTrailingSlash(path: string): string {
  const [base, query] = path.split('?');
  return `${base.endsWith('/') ? base : `${base}/`}${query ? `?${query}` : ''}`;
}

/** fetch() wrapper: JSON in/out, cookies included, `{ error }` bodies turned into thrown Errors. */
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const isForm = typeof FormData !== 'undefined' && init.body instanceof FormData;
  const res = await fetch(withTrailingSlash(path), {
    credentials: 'same-origin',
    cache: 'no-store',
    ...init,
    headers: isForm ? init.headers : { 'Content-Type': 'application/json', ...init.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.error || `Request failed (${res.status})`) as Error & { code?: string; status?: number };
    err.code = data?.code;
    err.status = res.status;
    throw err;
  }
  return data as T;
}

/** Run a mutating call and always resolve to { success, message } for form feedback. */
export async function asResult(promise: Promise<{ message?: string }>): Promise<Result> {
  try {
    const data = await promise;
    return { success: true, message: data?.message || 'Done.' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Something went wrong. Please try again.' };
  }
}

const json = (body: unknown) => JSON.stringify(body);

/* ------------------------------------------------------------------ */
/* Public catalog                                                      */
/* ------------------------------------------------------------------ */

export async function getTours(): Promise<TourPackage[]> {
  try {
    return await apiFetch<TourPackage[]>('/api/tours');
  } catch (err) {
    console.warn('Could not load tours:', err);
    return [];
  }
}

export async function getTourBySlug(slug: string): Promise<TourPackage | null> {
  try {
    return await apiFetch<TourPackage>(`/api/tours/${encodeURIComponent(slug)}`);
  } catch {
    return null;
  }
}

export async function getDestinations(): Promise<Destination[]> {
  try {
    return await apiFetch<Destination[]>('/api/destinations');
  } catch (err) {
    console.warn('Could not load destinations:', err);
    return [];
  }
}

export async function getBlogs(): Promise<Blog[]> {
  try {
    return await apiFetch<Blog[]>('/api/blogs');
  } catch (err) {
    console.warn('Could not load blogs:', err);
    return [];
  }
}

/* ------------------------------------------------------------------ */
/* Visitor forms                                                       */
/* ------------------------------------------------------------------ */

export function submitInquiry(inquiry: Inquiry): Promise<Result> {
  return asResult(apiFetch('/api/inquiries', { method: 'POST', body: json(inquiry) }));
}

/** Contact form; throws on failure (the contact page shows its own error). */
export async function submitContact(contact: { name: string; email: string; phone: string; message: string }): Promise<Result> {
  const data = await apiFetch<{ message: string }>('/api/contacts', { method: 'POST', body: json(contact) });
  return { success: true, message: data.message };
}

/** Subscribe step 1: email the visitor a link to the subscription form */
export function requestSubscription(email: string): Promise<Result> {
  return asResult(apiFetch('/api/subscribe/invite', { method: 'POST', body: json({ email }) }));
}

/** Subscribe step 2: save the subscription form details */
export function completeSubscription(subscriber: { name: string; email: string; phone: string; location: string }): Promise<Result> {
  return asResult(apiFetch('/api/subscribe/complete', { method: 'POST', body: json(subscriber) }));
}

/* ------------------------------------------------------------------ */
/* Admin content management                                            */
/* ------------------------------------------------------------------ */

/** Upload an image to Hostinger (FTP) and get its public URL. */
export async function uploadImage(file: File, prefix: string): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  form.append('prefix', prefix);
  return (await apiFetch<{ url: string }>('/api/admin/upload', { method: 'POST', body: form })).url;
}

/** Tour fields sent by the admin tour form (location/category/nights are derived on the server). */
export type TourPayload = Record<string, unknown>;

/** Creating a tour also emails subscribers (server-side). */
export function createTour(tour: TourPayload): Promise<Result> {
  return asResult(apiFetch('/api/admin/tours', { method: 'POST', body: json(tour) }));
}

export function updateTour(id: string, tour: TourPayload): Promise<Result> {
  return asResult(apiFetch(`/api/admin/tours/${id}`, { method: 'PATCH', body: json(tour) }));
}

export function deleteTour(id: string): Promise<Result> {
  return asResult(apiFetch(`/api/admin/tours/${id}`, { method: 'DELETE' }));
}

export function createDestination(destination: Omit<Destination, 'id' | 'slug'>): Promise<Result> {
  return asResult(apiFetch('/api/admin/destinations', { method: 'POST', body: json(destination) }));
}

export function updateDestination(id: string, destination: Partial<Destination>): Promise<Result> {
  return asResult(apiFetch(`/api/admin/destinations/${id}`, { method: 'PATCH', body: json(destination) }));
}

export function deleteDestination(id: string): Promise<Result> {
  return asResult(apiFetch(`/api/admin/destinations/${id}`, { method: 'DELETE' }));
}

export function createBlog(blog: { title: string; author: string; content: string; image_url: string }): Promise<Result> {
  return asResult(apiFetch('/api/admin/blogs', { method: 'POST', body: json({ ...blog, imageUrl: blog.image_url }) }));
}

export function updateBlog(id: string, blog: Partial<Blog>): Promise<Result> {
  const { image_url, ...rest } = blog;
  return asResult(apiFetch(`/api/admin/blogs/${id}`, { method: 'PATCH', body: json({ ...rest, ...(image_url !== undefined ? { imageUrl: image_url } : {}) }) }));
}

export function deleteBlog(id: string): Promise<Result> {
  return asResult(apiFetch(`/api/admin/blogs/${id}`, { method: 'DELETE' }));
}
