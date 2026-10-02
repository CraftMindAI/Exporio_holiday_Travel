// Browser-side account functions (signup / sign-in / verification), backed by /api/auth/*.
import { apiFetch, asResult, Result } from '@/lib/api';

export type CurrentUser = { id: string; name: string; email: string; phone: string; isAdmin: boolean; adminPath?: string };

type PublicUser = { id: string; name: string; email: string; phone: string; role: 'client' | 'admin' };

const AUTH_EVENT = 'exporio-auth-change';

function toCurrentUser(user: PublicUser, adminPath?: string): CurrentUser {
  return { id: user.id, name: user.name, email: user.email, phone: user.phone, isAdmin: user.role === 'admin', adminPath };
}

/** Tell other components on the page (e.g. the Header) that the user signed in or out. */
function announceAuthChange() {
  window.dispatchEvent(new Event(AUTH_EVENT));
}

/** The signed-in user, or null. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const { user, adminPath } = await apiFetch<{ user: PublicUser | null; adminPath?: string }>('/api/auth/me');
    return user ? toCurrentUser(user, adminPath) : null;
  } catch {
    return null;
  }
}

/** Create an account; a verification link is emailed and must be clicked before signing in. */
export function signUpUser(input: { name: string; email: string; phone: string; password: string }): Promise<Result> {
  return asResult(apiFetch('/api/auth/signup', { method: 'POST', body: JSON.stringify(input) }));
}

/** Sign in. `notVerified` is set when the email hasn't been verified yet. */
export async function signInUser(email: string, password: string): Promise<Result & { notVerified?: boolean; user?: CurrentUser }> {
  try {
    const data = await apiFetch<{ message: string; user: PublicUser; redirectTo?: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    announceAuthChange();
    return { success: true, message: data.message, user: toCurrentUser(data.user, data.redirectTo) };
  } catch (err: any) {
    return { success: false, notVerified: err?.code === 'email_not_confirmed', message: err?.message || 'Sign in failed.' };
  }
}

export function resendVerification(email: string): Promise<Result> {
  return asResult(apiFetch('/api/auth/resend', { method: 'POST', body: JSON.stringify({ email }) }));
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
