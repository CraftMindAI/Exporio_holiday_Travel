// Step 1 of subscribing: email the visitor a link to the /subscribe form.
import { handler, json, normalizeEmail } from '../_shared/http.ts';
import { transporter, fromAddress, siteUrl, emailLayout, emailButton } from '../_shared/mailer.ts';

Deno.serve(handler(async (body) => {
  const email = normalizeEmail(body.email);
  if (!email) return json({ error: 'Please enter a valid email address.' }, 400);

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

  return json({ success: true, message: 'Check your inbox! We sent you a link to complete your subscription.' });
}));
