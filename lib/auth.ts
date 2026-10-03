// Server-only authentication: bcrypt passwords + database sessions in an httpOnly cookie.
import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import type { User } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export const SESSION_COOKIE = 'exporio_session';
const SESSION_DAYS = 30;

export type PublicUser = { id: string; name: string; email: string; phone: string; role: 'admin' | 'employee' };

export function toPublicUser(user: User): PublicUser {
  return { id: user.id, name: user.name, email: user.email, phone: user.phone ?? '', role: user.role };
}

export const hashPassword = (password: string) => bcrypt.hash(password, 12);

/** Checked when an email has no account, so login timing doesn't reveal which emails exist. */
export const DUMMY_PASSWORD_HASH = bcrypt.hashSync('exporio-no-such-user', 12);
export const verifyPassword = (password: string, hash: string) => bcrypt.compare(password, hash);

const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');
const newToken = () => randomBytes(32).toString('base64url');

/* ------------------------------------------------------------------ */
/* Sessions                                                            */
/* ------------------------------------------------------------------ */

/** Start a session for the user and set the session cookie. */
export async function createSession(userId: string): Promise<void> {
  const token = newToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  await prisma.session.create({ data: { userId, tokenHash: sha256(token), expiresAt } });

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt,
  });
}

/** The signed-in user for this request, or null. */
export async function getSessionUser(): Promise<User | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({ where: { tokenHash: sha256(token) }, include: { user: true } });
  if (!session || session.expiresAt < new Date()) return null;
  return session.user;
}

/** The signed-in staff member (admin or employee) for this request, or null. */
export async function getStaffUser(): Promise<User | null> {
  const user = await getSessionUser();
  return user && (user.role === 'admin' || user.role === 'employee') ? user : null;
}

/** The signed-in admin for this request, or null. */
export async function getAdminUser(): Promise<User | null> {
  const user = await getSessionUser();
  return user?.role === 'admin' ? user : null;
}

/** End this browser's session. */
export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await prisma.session.deleteMany({ where: { tokenHash: sha256(token) } });
  store.delete(SESSION_COOKIE);
}

/** Sign the user out everywhere except (optionally) the current browser. */
export async function revokeOtherSessions(userId: string): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  await prisma.session.deleteMany({ where: { userId, ...(token ? { NOT: { tokenHash: sha256(token) } } : {}) } });
}

/* ------------------------------------------------------------------ */
/* Admin dashboard URL                                                 */
/* ------------------------------------------------------------------ */

/**
 * Dashboard URL /auth/profile/v1/<token>/ where <token> is a one-way hash of the staff member's id.
 * The hash keeps the real id out of the URL; access is enforced by the session + role.
 */
export function adminProfilePath(userId: string): string {
  return `/auth/profile/v1/${sha256(`exporio-admin:${userId}`).slice(0, 40)}/`;
}
