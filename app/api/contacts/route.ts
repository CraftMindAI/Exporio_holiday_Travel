import { after } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendContactAlert } from '@/lib/notify';
import { cleanText, fail, normalizeEmail, ok, PHONE_RE, readJson, route } from '@/lib/http';

/** POST /api/contacts - message from the contact page. Saved, then emailed to the admin(s) in the background. */
export const POST = route(async (req: Request) => {
  const body = await readJson(req);
  const name = cleanText(body.name, 150);
  const phone = cleanText(body.phone, 30);
  const rawEmail = cleanText(body.email, 150);
  const email = rawEmail ? normalizeEmail(rawEmail) : '';
  const message = cleanText(body.message, 5000);

  if (!name) return fail('Please enter your name.');
  if (!PHONE_RE.test(phone)) return fail('Please enter a valid phone number.');
  if (email === null) return fail('Please enter a valid email address.');

  const contact = await prisma.contact.create({ data: { name, phone, email, message } });

  // Email the admin after responding, so the visitor isn't kept waiting on Gmail.
  // The message is already saved, so a mail problem never loses the enquiry.
  after(() => sendContactAlert(contact).catch((err) => console.error('[contacts] admin email failed:', err)));

  return ok({ success: true, message: 'Message sent successfully!' }, 201);
});
