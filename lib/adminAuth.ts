// Browser-side admin account functions, backed by /api/auth/*.
import { apiFetch, asResult, Result } from '@/lib/api';
import { signInUser, signOutUser } from '@/lib/userAuth';

export type AdminSession = { id: string; name: string; email: string; phone: string };

/**
 * Sign in and make sure the account is an admin.
 * On success, `redirectTo` is the admin's dashboard URL (/auth/profile/v1/<hashed-id>/).
 */
export async function adminLogin(email: string, password: string): Promise<Result & { redirectTo?: string }> {
  const res = await signInUser(email, password);
  if (!res.success) return res;
  if (!res.user?.isAdmin || !res.user.adminPath) {
    await signOutUser();
    return { success: false, message: 'This account does not have admin access.' };
  }
  return { success: true, message: res.message, redirectTo: res.user.adminPath };
}

export async function adminLogout(): Promise<void> {
  await signOutUser();
}

/** Update the signed-in user's name / mobile / email (email changes need currentPassword). */
export async function updateProfile(input: { name: string; phone: string; email: string; currentPassword?: string }): Promise<Result & { user?: AdminSession }> {
  try {
    const data = await apiFetch<{ message: string; user: AdminSession }>('/api/auth/profile', { method: 'PATCH', body: JSON.stringify(input) });
    return { success: true, message: data.message, user: data.user };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Could not update profile.' };
  }
}

/** Change password (the server re-checks the current password). */
export function changePassword(_email: string, currentPassword: string, newPassword: string): Promise<Result> {
  return asResult(apiFetch('/api/auth/password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) }));
}
