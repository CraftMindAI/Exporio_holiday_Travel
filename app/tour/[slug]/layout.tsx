import { getTours } from '@/lib/supabase';
import { staticTourSlugs } from '@/config/staticRoutes';

export async function generateStaticParams() {
  const tours = await getTours();
  const slugs = new Set([...staticTourSlugs, ...tours.map((tour) => tour.slug)]);

  return Array.from(slugs, (slug) => ({ slug }));
}

export default function TourLayout({ children }: { children: React.ReactNode }) {
  return children;
}