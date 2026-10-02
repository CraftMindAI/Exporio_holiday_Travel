import { prisma } from '@/lib/prisma';
import { createVerifyToken } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/authEmails';
import { normalizeEmail, ok, readJson, route } from '@/lib/http';

const GENERIC = 'If that account is waiting for verification, we sent a new link. Please check your inbox (and spam folder).';

/** POST /api/auth/resend - send the verification email again. Same reply either way, so it can't probe for accounts. */
export const POST = route(async (req: Request) => {
  const email = normalizeEmail((await readJson(req)).email);
  const user = email ? await prisma.user.findUnique({ where: { email } }) : null;

  if (user && !user.emailVerifiedAt) {
    await sendVerificationEmail(user, await createVerifyToken(user.id), req);
  }
  return ok({ success: true, message: GENERIC });
});
