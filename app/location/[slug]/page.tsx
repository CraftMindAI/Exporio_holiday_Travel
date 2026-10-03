import type { Metadata } from 'next';
import LocationTours from '@/components/LocationTours';
import JsonLd from '@/components/JsonLd';
import { getAllDestinations, getAllTours } from '@/lib/data';
import { locationJsonLd, locationMetadata, locationNameFromSlug, toursForLocation } from '@/lib/seo';
import { FOOTER_LOCATIONS } from '@/config/siteConfig';

type Props = { params: Promise<{ slug: string }> };

async function loadLocation(slug: string) {
  const [tours, destinations] = await Promise.all([getAllTours(), getAllDestinations()]);
  const destination = destinations.find((d) => d.slug === slug);
  return {
    name: locationNameFromSlug(slug, destinations),
    imageUrl: destination?.imageUrl,
    matching: toursForLocation(tours, slug),
    all: tours,
  };
}

/** Static GitHub Pages build: pre-render every place (and footer link). On Hostinger pages render on demand. */
export async function generateStaticParams() {
  if (!process.env.STATIC_EXPORT) return [];
  const slugs = new Set([...(await getAllDestinations()).map((d) => d.slug), ...FOOTER_LOCATIONS.map((l) => l.slug)]);
  return [...slugs].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { name, imageUrl, matching } = await loadLocation(slug);
  return locationMetadata(slug, name, matching, imageUrl);
}

export default async function LocationPage({ params }: Props) {
  const { slug } = await params;
  const { name, matching, all } = await loadLocation(slug);

  return (
    <>
      <JsonLd data={locationJsonLd(slug, name, matching)} />
      <LocationTours slug={slug} title={name} initialTours={matching.length > 0 ? matching : all} />
    </>
  );
}
