import { staticPageMetadata } from '@/lib/seo';

export const metadata = staticPageMetadata({
  title: 'Contact Us - Book Your Tour Package',
  description:
    'Contact Exporio Holidays, Madurai for tour package bookings, custom itineraries, permits and travel queries. Call +91 8796911335 or email us - 24/7 support.',
  path: '/contact/',
  keywords: ['contact Exporio Holidays', 'travel agency Madurai', 'book tour package', 'tour package enquiry', 'travel agent Tamil Nadu'],
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
