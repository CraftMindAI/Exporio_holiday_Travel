// Server-only account emails.
import 'server-only';
import type { User } from '@prisma/client';
import { transporter, fromAddress, emailLayout, emailButton, escapeHtml } from '@/lib/mailer';
import { requestOrigin } from '@/lib/http';

export async function sendVerificationEmail(user: User, token: string, req: Request): Promise<void> {
  const link = `${requestOrigin(req)}/api/auth/verify/?token=${encodeURIComponent(token)}`;
  await transporter.sendMail({
    from: fromAddress,
    to: user.email,
    subject: 'Verify your Exporio Holidays account',
    html: emailLayout(`
      <h2 style="color: #0b2038;">Welcome, ${escapeHtml(user.name)}!</h2>
      <p>Please confirm your email address to activate your Exporio Holidays account.</p>
      ${emailButton(link, 'Verify My Email')}
      <p style="font-size: 12px; color: #64748b;">This link expires in 24 hours. If you didn't create an account, you can ignore this email.</p>
    `),
  });
}
