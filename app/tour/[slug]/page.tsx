import type { Metadata } from 'next';
import TourDetail from '@/components/TourDetail';
import JsonLd from '@/components/JsonLd';
import { getAllDestinations, getTourForSlug } from '@/lib/data';
import { destinationForTour, tourJsonLd, tourMetadata } from '@/lib/seo';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tour = await getTourForSlug(slug);
  if (!tour) return { title: 'Tour Package Not Found', robots: { index: false } };
  return tourMetadata(tour);
}

export default async function TourPage({ params }: Props) {
  const { slug } = await params;
  const [tour, destinations] = await Promise.all([getTourForSlug(slug), getAllDestinations()]);

  return (
    <>
      {tour && <JsonLd data={tourJsonLd(tour, destinationForTour(tour, destinations))} />}
      <TourDetail slug={slug} initialTour={tour} />
    </>
  );
}
