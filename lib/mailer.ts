// Server-only email sending through Gmail (EMAIL_USER / EMAIL_PASSWORD app password).
import 'server-only';
import nodemailer from 'nodemailer';

const emailUser = process.env.EMAIL_USER ?? '';

export const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: { user: emailUser, pass: process.env.EMAIL_PASSWORD ?? '' },
});

export const fromAddress = `"Exporio Holidays" <${emailUser}>`;

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://exporioholidays.com').replace(/\/+$/, '');

export function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

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
  return `<p><a href="${href}" style="background-color: #ff4e00; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">${label}</a></p>`;
}
