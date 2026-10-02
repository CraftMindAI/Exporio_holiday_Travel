import nodemailer from 'npm:nodemailer@6.9.16';

const emailUser = Deno.env.get('EMAIL_USER') ?? '';

// Supabase blocks outbound ports 25 and 587, so use Gmail's implicit-TLS port 465.
export const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: { user: emailUser, pass: Deno.env.get('EMAIL_PASSWORD') ?? '' },
});

export const fromAddress = `"Exporio Holidays" <${emailUser}>`;

export const siteUrl = (Deno.env.get('SITE_URL') ?? 'https://exporioholidays.com').replace(/\/+$/, '');

export function emailLayout(content: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; color: #1e293b;">
      ${content}
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #999;">Exporio Holidays &middot; Travel Beyond Borders</p>
    </div>
  `;
}

export function emailButton(href: string, label: string): string {
  return `<p><a href="${href}" style="background-color: #00d2ff; color: #0b2038; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">${label}</a></p>`;
}
