import { getDestinations } from '@/lib/supabase';
import { staticTourSlugs } from '@/config/staticRoutes';

export async function generateStaticParams() {
  const destinations = await getDestinations();
  const slugs = new Set([
    ...staticTourSlugs,
    ...destinations.map((destination) => destination.slug),
  ]);

  return Array.from(slugs, (slug) => ({ slug }));
}

export default function LocationLayout({ children }: { children: React.ReactNode }) {
  return children;
}