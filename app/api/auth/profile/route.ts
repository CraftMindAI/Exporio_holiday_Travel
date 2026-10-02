import { prisma } from '@/lib/prisma';
import { getSessionUser, toPublicUser, verifyPassword } from '@/lib/auth';
import { cleanText, fail, normalizeEmail, ok, PHONE_RE, readJson, route } from '@/lib/http';

/**
 * PATCH /api/auth/profile - update the signed-in user's name, mobile number and email.
 * Changing the email (the sign-in name) requires `currentPassword`.
 */
export const PATCH = route(async (req: Request) => {
  const user = await getSessionUser();
  if (!user) return fail('Please sign in.', 401);

  const body = await readJson(req);
  const name = cleanText(body.name, 150);
  const phone = cleanText(body.phone, 30);
  if (!name) return fail('Please enter your name.');
  if (phone && !PHONE_RE.test(phone)) return fail('Please enter a valid mobile number.');

  let email = user.email;
  if (body.email !== undefined) {
    const requested = normalizeEmail(body.email);
    if (!requested) return fail('Please enter a valid email address.');

    if (requested !== user.email) {
      if (!(await verifyPassword(String(body.currentPassword ?? ''), user.password))) {
        return fail('Enter your current password to change your email.', 400, { code: 'password_required' });
      }
      const taken = await prisma.user.findUnique({ where: { email: requested }, select: { id: true } });
      if (taken) return fail('Another account already uses that email address.', 409);
      email = requested;
    }
  }

  const updated = await prisma.user.update({ where: { id: user.id }, data: { name, phone: phone || null, email } });
  return ok({
    success: true,
    message: email !== user.email ? `Profile updated. Sign in with ${email} from now on.` : 'Profile updated successfully.',
    user: toPublicUser(updated),
  });
});
