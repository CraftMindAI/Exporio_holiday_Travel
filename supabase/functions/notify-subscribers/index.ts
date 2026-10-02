// Emails every subscriber about a newly published tour package.
// The tour is looked up by slug and can only be announced once, so this endpoint
// cannot be used to send arbitrary content or to spam subscribers repeatedly.
import { handler, json, escapeHtml } from '../_shared/http.ts';
import { db } from '../_shared/db.ts';
import { transporter, fromAddress, siteUrl, emailLayout, emailButton } from '../_shared/mailer.ts';

// Keep each message's recipient list small to stay within Gmail's per-message limits.
const BCC_BATCH_SIZE = 50;

Deno.serve(handler(async (body) => {
  const slug = String(body.slug ?? '').trim();
  if (!slug) return json({ error: 'Tour slug is required' }, 400);

  // Atomically claim the tour so concurrent or repeated calls send only once.
  const { data: tour, error: claimError } = await db
    .from('tours')
    .update({ subscribers_notified_at: new Date().toISOString() })
    .eq('slug', slug)
    .is('subscribers_notified_at', null)
    .select('id, title, slug, location, price, duration_nights, duration_days, image_url')
    .maybeSingle();

  if (claimError) throw claimError;
  if (!tour) return json({ message: 'Tour not found or subscribers were already notified' }, 200);

  try {
    const { data: subscribers, error: subError } = await db.from('subscribers').select('email');
    if (subError) throw subError;

    const emails = (subscribers ?? []).map((s) => s.email as string);
    if (emails.length === 0) return json({ message: 'No subscribers found' }, 200);

    const title = escapeHtml(tour.title);
    const location = escapeHtml(tour.location);
    const tourUrl = `${siteUrl}/tour/${encodeURIComponent(tour.slug)}/`;
    const price = Number(tour.price).toLocaleString('en-IN');

    const html = emailLayout(`
      <h2 style="color: #0b2038;">New Tour Package: ${title}</h2>
      <img src="${escapeHtml(tour.image_url)}" alt="${title}" style="width: 100%; border-radius: 8px; margin: 8px 0;">
      <p>Hi there,</p>
      <p>We've just launched a new tour package you might love:</p>
      <ul style="padding-left: 18px; line-height: 1.6;">
        <li><strong>Destination:</strong> ${location}</li>
        <li><strong>Duration:</strong> ${tour.duration_nights} Nights / ${tour.duration_days} Days</li>
        <li><strong>Starting from:</strong> &#8377;${price}</li>
      </ul>
      ${emailButton(tourUrl, 'View Tour Package')}
      <p style="font-size: 12px; color: #64748b;">You are receiving this email because you subscribed to Exporio Holidays updates.</p>
    `);

    for (let i = 0; i < emails.length; i += BCC_BATCH_SIZE) {
      await transporter.sendMail({
        from: fromAddress,
        to: fromAddress,
        bcc: emails.slice(i, i + BCC_BATCH_SIZE),
        subject: `New Tour Package Available: ${tour.title}`,
        html,
      });
    }

    return json({ message: `Successfully sent email to ${emails.length} subscribers` }, 200);
  } catch (err) {
    // Release the claim so the admin can retry after a failure.
    await db.from('tours').update({ subscribers_notified_at: null }).eq('id', tour.id);
    throw err;
  }
}));
