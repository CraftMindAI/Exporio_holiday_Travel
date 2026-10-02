import { NextResponse } from 'next/server';
import { consumeVerifyToken, createSession } from '@/lib/auth';
import { requestOrigin, route } from '@/lib/http';

export const dynamic = 'force-dynamic';

/** GET /api/auth/verify?token=... - the link in the signup email. Verifies, signs in, and returns to the site. */
export const GET = route(async (req: Request) => {
  const token = new URL(req.url).searchParams.get('token') ?? '';
  const user = token ? await consumeVerifyToken(token) : null;

  if (!user) return NextResponse.redirect(new URL('/?verified=expired', requestOrigin(req)));

  await createSession(user.id);
  return NextResponse.redirect(new URL('/?verified=1', requestOrigin(req)));
});
