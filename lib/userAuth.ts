// Browser-side sign-in state for staff (admins and employees), backed by /api/auth/*.
import { apiFetch, Result } from '@/lib/api';

export type StaffRole = 'admin' | 'employee';
export type CurrentUser = { id: string; name: string; email: string; phone: string; role: StaffRole; isAdmin: boolean; adminPath?: string };

type PublicUser = { id: string; name: string; email: string; phone: string; role: StaffRole };

const AUTH_EVENT = 'exporio-auth-change';

function toCurrentUser(user: PublicUser, adminPath?: string): CurrentUser {
  return { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, isAdmin: user.role === 'admin', adminPath };
}

/** Tell other components on the page (e.g. the Header) that the user signed in or out. */
function announceAuthChange() {
  window.dispatchEvent(new Event(AUTH_EVENT));
}

/** The signed-in staff member, or null. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const { user, adminPath } = await apiFetch<{ user: PublicUser | null; adminPath?: string }>('/api/auth/me');
    return user ? toCurrentUser(user, adminPath) : null;
  } catch {
    return null;
  }
}

/** Staff sign-in. On success `user.adminPath` is the dashboard URL. */
export async function signInUser(email: string, password: string): Promise<Result & { user?: CurrentUser }> {
  try {
    const data = await apiFetch<{ message: string; user: PublicUser; redirectTo?: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    announceAuthChange();
    return { success: true, message: data.message, user: toCurrentUser(data.user, data.redirectTo) };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Sign in failed.' };
  }
}

export async function signOutUser(): Promise<void> {
  await apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined);
  announceAuthChange();
}

/** Re-run callback whenever the user signs in or out in this tab. */
export function onAuthChange(callback: () => void): () => void {
  window.addEventListener(AUTH_EVENT, callback);
  return () => window.removeEventListener(AUTH_EVENT, callback);
}
