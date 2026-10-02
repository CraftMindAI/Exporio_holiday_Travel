import { staticPageMetadata } from '@/lib/seo';

// /blogs/ renders the same page as /news/, so its canonical points at /news/ to avoid duplicate content
export const metadata = staticPageMetadata({
  title: 'Travel Blog - Guides, Tips & Itineraries',
  description:
    'Travel guides, destination tips and itinerary ideas for Sikkim, Kashmir, Kerala, Darjeeling, Andaman, Bhutan and more from the Exporio Holidays travel experts.',
  path: '/news/',
});

export default function BlogsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
