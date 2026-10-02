import { prisma } from '@/lib/prisma';
import { adminProfilePath, createSession, DUMMY_PASSWORD_HASH, toPublicUser, verifyPassword } from '@/lib/auth';
import { fail, normalizeEmail, ok, readJson, route } from '@/lib/http';

/** POST /api/auth/login - sign in with email + password. */
export const POST = route(async (req: Request) => {
  const body = await readJson(req);
  const email = normalizeEmail(body.email);
  const password = String(body.password ?? '');

  const user = email ? await prisma.user.findUnique({ where: { email } }) : null;
  const valid = await verifyPassword(password, user?.password || DUMMY_PASSWORD_HASH);
  if (!user || !valid) return fail('Invalid email or password.', 401);

  if (!user.emailVerifiedAt) {
    return fail('Please verify your email before signing in. Check your inbox for the verification link.', 403, { code: 'email_not_confirmed' });
  }

  await createSession(user.id);
  return ok({
    success: true,
    message: `Welcome back, ${user.name}!`,
    user: toPublicUser(user),
    redirectTo: user.role === 'admin' ? adminProfilePath(user.id) : undefined,
  });
});
