import { prisma } from '@/lib/prisma';
import { createVerifyToken, hashPassword } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/authEmails';
import { cleanText, fail, normalizeEmail, ok, PHONE_RE, readJson, route } from '@/lib/http';

/** POST /api/auth/signup - create a client account and email a verification link. */
export const POST = route(async (req: Request) => {
  const body = await readJson(req);
  const email = normalizeEmail(body.email);
  const name = cleanText(body.name, 150);
  const phone = cleanText(body.phone, 30);
  const password = String(body.password ?? '');

  if (!name) return fail('Please enter your name.');
  if (!email) return fail('Please enter a valid email address.');
  if (!PHONE_RE.test(phone)) return fail('Please enter a valid mobile number.');
  if (password.length < 8 || password.length > 200) return fail('Password must be at least 8 characters.');

  if (await prisma.user.findUnique({ where: { email }, select: { id: true } })) {
    return fail('An account with this email already exists. Please sign in instead.', 409);
  }

  const user = await prisma.user.create({
    data: { email, name, phone, password: await hashPassword(password), role: 'client' },
  });
  try {
    await sendVerificationEmail(user, await createVerifyToken(user.id), req);
  } catch (err) {
    // Don't leave an account the person can neither verify nor re-register
    console.error('[signup] verification email failed:', err);
    await prisma.user.delete({ where: { id: user.id } });
    return fail("We couldn't send the verification email right now. Please try again in a few minutes.", 502);
  }

  return ok({ success: true, message: `We sent a verification link to ${email}. Please verify your email, then sign in.` }, 201);
});
