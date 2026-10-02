import type { Metadata } from 'next';
import { SITE_NAME, staticPageMetadata } from '@/lib/seo';

const TITLE = 'Travel Blog - Guides, Tips & Itineraries';

// Applies to /news/; each /news/[slug]/ post overrides it with its own generateMetadata
const base = staticPageMetadata({
  title: TITLE,
  description:
    'Travel guides, destination tips and itinerary ideas for Sikkim, Kashmir, Kerala, Darjeeling, Andaman, Bhutan and more from the Exporio Holidays travel experts.',
  path: '/news/',
  keywords: ['travel blog', 'travel guide India', 'tour planning tips', 'Sikkim travel guide', 'Kashmir travel guide', 'Kerala travel guide'],
});

// Re-declare the template so blog post titles below this layout keep the "| Exporio Holidays" suffix
export const metadata: Metadata = {
  ...base,
  title: { default: TITLE, template: `%s | ${SITE_NAME}` },
};

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
