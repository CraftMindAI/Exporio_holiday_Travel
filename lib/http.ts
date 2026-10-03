// Shared helpers for API route handlers.
import 'server-only';
import { NextResponse } from 'next/server';
import type { User } from '@prisma/client';
import { getStaffUser } from '@/lib/auth';

export type RouteContext<P = Record<string, string>> = { params: Promise<P> };

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function fail(message: string, status = 400, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export async function readJson(req: Request): Promise<Record<string, unknown>> {
  try {
    const body = await req.json();
    return body && typeof body === 'object' ? body : {};
  } catch {
    return {};
  }
}

/** Wrap a handler so unexpected errors become a JSON 500 instead of an HTML error page. */
export function route<Args extends unknown[]>(fn: (...args: Args) => Promise<Response>) {
  return async (...args: Args): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (err) {
      console.error('[api]', err);
      return fail('Something went wrong. Please try again later.', 500);
    }
  };
}

/** Like route(), but only for signed-in staff (admins and employees). */
export function staffRoute<P>(fn: (user: User, req: Request, ctx: RouteContext<P>) => Promise<Response>) {
  return route(async (req: Request, ctx: RouteContext<P>) => {
    const user = await getStaffUser();
    if (!user) return fail('Staff sign-in required.', 401);
    return fn(user, req, ctx);
  });
}

/** Like route(), but only for signed-in admins (employees get 403). */
export function adminRoute<P>(fn: (admin: User, req: Request, ctx: RouteContext<P>) => Promise<Response>) {
  return route(async (req: Request, ctx: RouteContext<P>) => {
    const user = await getStaffUser();
    if (!user) return fail('Staff sign-in required.', 401);
    if (user.role !== 'admin') return fail('Only admins can do this.', 403);
    return fn(user, req, ctx);
  });
}

/** Public origin of the request (honours Hostinger's proxy headers). */
export function requestOrigin(req: Request): string {
  const forwardedHost = req.headers.get('x-forwarded-host');
  if (forwardedHost) return `${req.headers.get('x-forwarded-proto') ?? 'https'}://${forwardedHost}`;
  return new URL(req.url).origin;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(value: unknown): string | null {
  const email = String(value ?? '').trim().toLowerCase();
  return EMAIL_RE.test(email) && email.length <= 150 ? email : null;
}

export function cleanText(value: unknown, maxLength: number): string {
  return String(value ?? '').trim().slice(0, maxLength);
}

export const PHONE_RE = /^\+?[\d\s()-]{7,20}$/;

export function optionalNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export function stringList(value: unknown, maxItems = 20, maxLength = 300): string[] {
  return Array.isArray(value) ? value.map((v) => cleanText(v, maxLength)).filter(Boolean).slice(0, maxItems) : [];
}
