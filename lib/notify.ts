// Server-only subscriber emails: the subscribe invite and new-tour announcements.
import 'server-only';
import { prisma } from '@/lib/prisma';
import { getSetting } from '@/lib/settings';
import { formatLocation } from '@/lib/seo';
import { transporter, fromAddress, siteUrl, emailLayout, emailButton, escapeHtml } from '@/lib/mailer';

// Keep each message's recipient list small to stay within Gmail's per-message limits
const BCC_BATCH_SIZE = 50;

/** Email a visitor the link to the /subscribe form. */
export async function sendSubscribeInvite(email: string): Promise<void> {
  const formUrl = `${siteUrl}/subscribe/?email=${encodeURIComponent(email)}`;
  await transporter.sendMail({
    from: fromAddress,
    to: email,
    subject: 'Complete your Exporio Holidays subscription',
    html: emailLayout(`
      <h2 style="color: #0b2038;">You're almost subscribed!</h2>
      <p>Hi there,</p>
      <p>Thanks for your interest in Exporio Holidays. Tell us a little about yourself so we can send you new tour packages and exclusive deals.</p>
      ${emailButton(formUrl, 'Complete My Subscription')}
      <p style="font-size: 12px; color: #64748b;">If you didn't request this, you can safely ignore this email.</p>
    `),
  });
}

/**
 * Email every subscriber about a tour. Each tour is announced at most once:
 * the tour is claimed atomically via subscribers_notified_at before sending.
 */
export async function notifySubscribersAboutTour(tourId: string): Promise<{ success: boolean; message: string }> {
  if (!(await getSetting('customerNotifications'))) {
    return { success: true, message: 'Customer notifications are turned off, so subscribers were not emailed.' };
  }

  const claimed = await prisma.tour.updateMany({
    where: { id: tourId, subscribersNotifiedAt: null },
    data: { subscribersNotifiedAt: new Date() },
  });
  if (claimed.count === 0) return { success: true, message: 'Subscribers were already notified about this tour.' };

  try {
    const [tour, subscribers] = await Promise.all([
      prisma.tour.findUniqueOrThrow({ where: { id: tourId } }),
      prisma.subscriber.findMany({ select: { email: true } }),
    ]);
    const emails = subscribers.map((s) => s.email);
    if (emails.length === 0) return { success: true, message: 'No subscribers to notify yet.' };

    const title = escapeHtml(tour.title);
    const html = emailLayout(`
      <h2 style="color: #0b2038;">New Tour Package: ${title}</h2>
      <img src="${escapeHtml(tour.imageUrl.startsWith('/') ? `${siteUrl}${tour.imageUrl}` : tour.imageUrl)}" alt="${title}" style="width: 100%; border-radius: 8px; margin: 8px 0;">
      <p>Hi there,</p>
      <p>We've just launched a new tour package you might love:</p>
      <ul style="padding-left: 18px; line-height: 1.6;">
        <li><strong>Destination:</strong> ${escapeHtml(formatLocation(tour.location))}</li>
        <li><strong>Duration:</strong> ${tour.durationNights} Nights / ${tour.durationDays} Days</li>
        <li><strong>Starting from:</strong> &#8377;${Number(tour.price).toLocaleString('en-IN')}</li>
      </ul>
      ${emailButton(`${siteUrl}/tour/${encodeURIComponent(tour.slug)}/`, 'View Tour Package')}
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
    return { success: true, message: `Emailed ${emails.length} subscriber${emails.length === 1 ? '' : 's'}.` };
  } catch (err) {
    // Release the claim so the announcement can be retried
    await prisma.tour.update({ where: { id: tourId }, data: { subscribersNotifiedAt: null } });
    console.error('[notify] new tour email failed:', err);
    return { success: false, message: 'Tour saved, but the subscriber email could not be sent.' };
  }
}

/* ------------------------------------------------------------------ */
/* Admin alerts                                                        */
/* ------------------------------------------------------------------ */

/** Who gets admin alerts: ADMIN_NOTIFICATION_EMAIL (comma-separated) if set, otherwise every admin account. */
async function adminRecipients(): Promise<string[]> {
  const configured = (process.env.ADMIN_NOTIFICATION_EMAIL ?? '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);
  if (configured.length) return configured;

  const admins = await prisma.user.findMany({ where: { role: 'admin' }, select: { email: true } });
  return admins.length ? admins.map((a) => a.email) : [process.env.EMAIL_USER ?? ''].filter(Boolean);
}

/** Email the admin(s) about a new Contact Us message. Replies go straight to the customer. */
export async function sendContactAlert(contact: { name: string; email: string; phone: string; message: string }): Promise<void> {
  const to = await adminRecipients();
  if (!to.length) return;

  const row = (label: string, value: string) =>
    `<tr><td style="padding: 6px 12px 6px 0; color: #64748b; vertical-align: top;">${label}</td><td style="padding: 6px 0;">${value}</td></tr>`;
  const email = escapeHtml(contact.email);
  const phone = escapeHtml(contact.phone);

  await transporter.sendMail({
    from: fromAddress,
    to,
    ...(contact.email ? { replyTo: `"${contact.name.replace(/"/g, '')}" <${contact.email}>` } : {}),
    subject: `New Contact Us message from ${contact.name}`,
    html: emailLayout(`
      <h2 style="color: #0b2038;">New Contact Us message</h2>
      <table style="border-collapse: collapse; font-size: 14px;">
        ${row('Name', escapeHtml(contact.name))}
        ${row('Phone', `<a href="tel:${phone}">${phone}</a>`)}
        ${row('Email', contact.email ? `<a href="mailto:${email}">${email}</a>` : '—')}
      </table>
      <p style="margin: 16px 0 6px; color: #64748b;">Message</p>
      <div style="white-space: pre-wrap; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px;">${escapeHtml(contact.message || '(no message)')}</div>
      ${contact.email ? '<p style="font-size: 12px; color: #64748b;">Reply to this email to answer the customer directly.</p>' : ''}
    `),
  });
}
