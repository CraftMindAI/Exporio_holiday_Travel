import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { tourTitle, slug } = await request.json();

    if (!tourTitle) {
      return NextResponse.json({ error: 'Tour title is required' }, { status: 400 });
    }

    // Fetch all subscribers from supabase
    let subscriberEmails: string[] = [];

    if (supabase) {
      const { data, error } = await supabase.from('subscribers').select('email');
      if (error) {
        console.error('Error fetching subscribers:', error);
      } else if (data) {
        subscriberEmails = data.map((sub) => sub.email);
      }
    }

    if (subscriberEmails.length === 0) {
      return NextResponse.json({ message: 'No subscribers found' }, { status: 200 });
    }

    // Set up nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASSWORD || '',
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://craftmindai.github.io/Exporio_holiday_Travel/';
    const tourUrl = slug ? `${appUrl}/tour/${slug}` : appUrl;

    const mailOptions = {
      from: `"Exporio Holidays" <${process.env.EMAIL_USER}>`,
      bcc: subscriberEmails,
      subject: `New Tour Package Available: ${tourTitle}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
          <h2 style="color: #0b2038;">New Tour Package Announcement!</h2>
          <p>Hi there,</p>
          <p>We are excited to announce a new tour package: <strong>${tourTitle}</strong>.</p>
          <p>Check out the details and book your next adventure with Exporio Holidays!</p>
          <p><a href="${tourUrl}" style="background-color: #00d2ff; color: #0b2038; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Tour Package</a></p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #999;">You are receiving this email because you subscribed to our newsletter.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: `Successfully sent email to ${subscriberEmails.length} subscribers` }, { status: 200 });
  } catch (error: any) {
    console.error('Failed to notify subscribers:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
