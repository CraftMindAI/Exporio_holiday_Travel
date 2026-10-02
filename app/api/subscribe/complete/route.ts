import { prisma } from '@/lib/prisma';
import { cleanText, fail, normalizeEmail, ok, PHONE_RE, readJson, route } from '@/lib/http';

/** POST /api/subscribe/complete - step 2 of subscribing: save the /subscribe form. */
export const POST = route(async (req: Request) => {
  const body = await readJson(req);
  const email = normalizeEmail(body.email);
  const name = cleanText(body.name, 150);
  const phone = cleanText(body.phone, 30);
  const location = cleanText(body.location, 150);

  if (!email) return fail('Please enter a valid email address.');
  if (!name || !location) return fail('Please fill in your name and location.');
  if (!PHONE_RE.test(phone)) return fail('Please enter a valid phone number.');

  await prisma.subscriber.upsert({
    where: { email },
    create: { email, name, phone, location },
    update: { name, phone, location },
  });

  return ok({ success: true, message: "You're subscribed! We'll email you whenever we launch a new tour package." });
});
