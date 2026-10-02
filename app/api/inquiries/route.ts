import { prisma } from '@/lib/prisma';
import { cleanText, fail, ok, optionalNumber, PHONE_RE, readJson, route } from '@/lib/http';

/** POST /api/inquiries - booking / quote request from the website. */
export const POST = route(async (req: Request) => {
  const body = await readJson(req);
  const name = cleanText(body.name, 150);
  const phone = cleanText(body.phone, 30);
  const email = cleanText(body.email, 150);
  const travelDate = cleanText(body.travelDate, 10);

  if (!name) return fail('Please enter your name.');
  if (!PHONE_RE.test(phone)) return fail('Please enter a valid phone number.');

  // Only link real tours; anything else is saved as a general inquiry
  const tourId = cleanText(body.tourId, 36);
  const tour = tourId ? await prisma.tour.findUnique({ where: { id: tourId }, select: { id: true } }) : null;

  await prisma.inquiry.create({
    data: {
      name,
      phone,
      email,
      tourId: tour?.id ?? null,
      tourTitle: cleanText(body.tourTitle, 255) || 'General Inquiry',
      travelDate: /^\d{4}-\d{2}-\d{2}$/.test(travelDate) ? new Date(`${travelDate}T00:00:00Z`) : null,
      guestsCount: Math.min(Math.max(optionalNumber(body.guestsCount) ?? 2, 1), 100),
      message: cleanText(body.message, 5000) || null,
    },
  });

  return ok({ success: true, message: 'Your booking inquiry has been sent! We will call you shortly.' }, 201);
});
