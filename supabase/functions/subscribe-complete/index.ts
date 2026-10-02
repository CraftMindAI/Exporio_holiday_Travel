// Step 2 of subscribing: save the /subscribe form into the subscribers table.
import { handler, json, normalizeEmail } from '../_shared/http.ts';
import { db } from '../_shared/db.ts';

function cleanText(value: unknown, maxLength: number): string {
  return String(value ?? '').trim().slice(0, maxLength);
}

Deno.serve(handler(async (body) => {
  const email = normalizeEmail(body.email);
  const name = cleanText(body.name, 150);
  const phone = cleanText(body.phone, 30);
  const location = cleanText(body.location, 150);

  if (!email) return json({ error: 'Please enter a valid email address.' }, 400);
  if (!name || !location) return json({ error: 'Please fill in your name and location.' }, 400);
  if (!/^\+?[\d\s()-]{7,20}$/.test(phone)) return json({ error: 'Please enter a valid phone number.' }, 400);

  const { error } = await db
    .from('subscribers')
    .upsert({ email, name, phone, location }, { onConflict: 'email' });

  if (error) {
    console.error('Subscriber upsert failed:', error);
    return json({ error: 'Could not save your subscription. Please try again.' }, 500);
  }

  return json({ success: true, message: "You're subscribed! We'll email you whenever we launch a new tour package." });
}));
