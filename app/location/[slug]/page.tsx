import type { Metadata } from 'next';
import LocationTours from '@/components/LocationTours';
import JsonLd from '@/components/JsonLd';
import { getAllDestinations, getAllTours } from '@/lib/data';
import { locationJsonLd, locationMetadata, locationNameFromSlug, toursForLocation } from '@/lib/seo';

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
