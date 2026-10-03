import type { Metadata } from 'next';
import { siteConfig } from '@/config/siteConfig';
import { TourPackage, Destination, Blog } from '@/types';

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://exporioholidays.com').replace(/\/+$/, '');
export const SITE_NAME = 'Exporio Holidays';
export const DEFAULT_OG_IMAGE = '/exporio-logo.jpeg';

export const DEFAULT_TITLE = 'Exporio Holidays | Travel Beyond Borders - Best Tour & Travel Packages';
export const DEFAULT_DESCRIPTION =
  'Book customized domestic & international tour packages with Exporio Holidays. Sikkim, Kashmir, Darjeeling, Kerala, Andaman, Bhutan, Thailand, Bali & more with best prices and 24/7 support.';

export const DEFAULT_KEYWORDS = [
  'Exporio Holidays',
  'Travel Beyond Borders',
  'tour packages',
  'holiday packages',
  'travel agency in Madurai',
  'travel agency in Tamil Nadu',
  'domestic tour packages',
  'international tour packages',
  'honeymoon packages',
  'family tour packages',
  'Sikkim tour package',
  'Gangtok tour package',
  'Kashmir tour package',
  'Darjeeling tour package',
  'Kerala tour package',
  'Andaman tour package',
  'Shimla Manali tour package',
  'Bhutan tour package',
  'Thailand tour package',
  'Bali tour package',
];

/** Absolute URL for a site path; trailing slash matches `trailingSlash: true`. */
export function absoluteUrl(path = '/'): string {
  if (/^https?:\/\//.test(path)) return path;
  const clean = `/${path.replace(/^\/+/, '')}`;
  return `${SITE_URL}${clean.endsWith('/') || clean.includes('.') ? clean : `${clean}/`}`;
}

const LOCATION_FIXES: Record<string, string> = {
  shimlamanali: 'Shimla Manali',
  wb: 'West Bengal',
  up: 'Uttar Pradesh',
};

/** Turn raw DB locations ("Shimlamanali", "thailand-tour-package", "Darjeeling, WB") into readable names. */
export function formatLocation(raw: string): string {
  return raw
    .split(',')
    .map((part) => {
      const words = part.trim().replace(/-?tour-?packages?$/i, '').replace(/[-_]+/g, ' ').trim();
      const fixed = LOCATION_FIXES[words.toLowerCase()];
      if (fixed) return fixed;
      return words.replace(/\b\w/g, (c) => c.toUpperCase());
    })
    .filter(Boolean)
    .join(', ');
}

/** Fix glued place names that appear in DB tour titles, e.g. "Shimlamanali 4 Days..." */
export function cleanTitle(title: string): string {
  return title.replace(/\bshimlamanali\b/gi, 'Shimla Manali').replace(/\s+/g, ' ').trim();
}

/** Readable destination name for a location slug, e.g. "kashmir-tour-package" -> "Kashmir". */
export function locationNameFromSlug(slug: string, destinations: Destination[] = []): string {
  return destinations.find((d) => d.slug === slug)?.name || formatLocation(slug);
}

function truncate(text: string, max: number): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).replace(/\s+\S*$/, '')}…`;
}

function formatPrice(price: number): string {
  return `₹${Number(price).toLocaleString('en-IN')}`;
}

function uniq(values: string[]): string[] {
  const seen = new Set<string>();
  return values.filter((v) => {
    const key = v.toLowerCase();
    if (!v || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Shared Open Graph / Twitter / canonical block for a page. */
function pageMetadata({
  title,
  description,
  path,
  keywords,
  image,
  type = 'website',
  publishedTime,
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
}): Metadata {
  const url = absoluteUrl(path);
  const images = [{ url: absoluteUrl(image || DEFAULT_OG_IMAGE), alt: title }];

  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: 'en_IN',
      type,
      images,
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: images.map((i) => i.url),
    },
  };
}

export function staticPageMetadata(args: { title: string; description: string; path: string; keywords?: string[] }): Metadata {
  return pageMetadata(args);
}

/* ------------------------------------------------------------------ */
/* Tour packages                                                       */
/* ------------------------------------------------------------------ */

export function tourMetadata(tour: TourPackage): Metadata {
  const name = cleanTitle(tour.title);
  const location = formatLocation(tour.location);
  const duration = `${tour.durationNights}N/${tour.durationDays}D`;
  const highlights = tour.highlights?.slice(0, 3).join(', ');

  // Many DB titles already say "... 5 Days 4 Nights Package"; only add what's missing
  const mentionsPackage = /package|tour|trip/i.test(name);
  const mentionsDuration = /\d+\s*(n|d|nights?|days?)\b/i.test(name);
  const title = [
    name,
    mentionsDuration ? '' : ` ${duration}`,
    mentionsPackage ? '' : ` ${location} Tour Package`,
    tour.showPrice === false ? '' : ` @ ${formatPrice(tour.price)}`,
  ].join('');
  const description = truncate(
    `Book ${name}, a ${tour.durationNights} nights / ${tour.durationDays} days ${location} tour package` +
      (tour.showPrice === false ? '' : ` starting at ${formatPrice(tour.price)} per person`) +
      (highlights ? `. Highlights: ${highlights}` : '') +
      '. Customizable itinerary, hotels, transfers & 24/7 support by Exporio Holidays.',
    160,
  );

  const keywords = uniq([
    name,
    `${location} tour package`,
    `${location} holiday package`,
    `${location} trip`,
    `${tour.durationNights} nights ${tour.durationDays} days ${location} package`,
    `${location} honeymoon package`,
    `${location} family tour`,
    `${tour.category} tour packages`,
    ...(tour.highlights || []),
    SITE_NAME,
  ]);

  return pageMetadata({ title, description, path: `/tour/${tour.slug}/`, keywords, image: tour.imageUrl });
}

const STOP_WORDS = new Set(['tour', 'tours', 'package', 'packages', 'and', 'islands', 'island']);

function destinationTokens(d: Destination): string[] {
  return `${d.name} ${d.slug}`
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

/** The destination page a tour belongs to, e.g. a "Gangtok" tour -> "Sikkim & Gangtok". */
export function destinationForTour(tour: TourPackage, destinations: Destination[]): Destination | undefined {
  const haystack = `${tour.location} ${tour.slug}`.toLowerCase().replace(/[^a-z]+/g, '');
  return destinations.find((d) => destinationTokens(d).some((token) => haystack.includes(token)));
}

/** Tours shown on a /location/[slug] page (same rule the page has always used). */
export function toursForLocation(tours: TourPackage[], slug: string): TourPackage[] {
  const key = slug.split('-')[0];
  return tours.filter((t) => t.slug.includes(slug) || slug.includes(t.slug) || t.location.toLowerCase().includes(key));
}

export function tourJsonLd(tour: TourPackage, destination?: Destination) {
  const url = absoluteUrl(`/tour/${tour.slug}/`);
  const location = formatLocation(tour.location);

  return [
    {
      '@context': 'https://schema.org',
      '@type': ['Product', 'TouristTrip'],
      name: cleanTitle(tour.title),
      description: `${tour.durationNights} nights / ${tour.durationDays} days ${location} tour package by ${SITE_NAME}.`,
      image: absoluteUrl(tour.imageUrl),
      url,
      sku: tour.slug,
      category: `${tour.category === 'international' ? 'International' : 'Domestic'} Tour Package`,
      brand: { '@type': 'Brand', name: SITE_NAME },
      touristType: ['Family', 'Couples', 'Friends'],
      ...(tour.itinerary?.length
        ? {
            itinerary: {
              '@type': 'ItemList',
              itemListElement: tour.itinerary.map((day, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                name: `Day ${day.day}: ${day.title}`,
                description: day.description,
              })),
            },
          }
        : {}),
      // Price offer only when the price is shown on the website
      ...(tour.showPrice === false
        ? {}
        : {
          offers: {
            '@type': 'Offer',
            url,
            price: Number(tour.price),
            priceCurrency: 'INR',
            availability: 'https://schema.org/InStock',
            seller: { '@type': 'TravelAgency', name: SITE_NAME, url: SITE_URL },
          },
          }),
    },
    breadcrumbJsonLd([
      { name: 'Home', path: '/' },
      ...(destination ? [{ name: `${destination.name} Tour Packages`, path: `/location/${destination.slug}/` }] : []),
      { name: cleanTitle(tour.title), path: `/tour/${tour.slug}/` },
    ]),
  ];
}

/* ------------------------------------------------------------------ */
/* Destination / location pages                                        */
/* ------------------------------------------------------------------ */

export function locationMetadata(slug: string, name: string, tours: TourPackage[], imageUrl?: string): Metadata {
  const prices = tours.filter((t) => t.showPrice !== false).map((t) => t.price).filter((p) => p > 0);
  const fromPrice = prices.length ? ` starting at ${formatPrice(Math.min(...prices))}` : '';
  const count = tours.length ? `${tours.length}+ ` : '';

  const title = `${name} Tour Packages - Best ${name} Holiday Packages${fromPrice ? ` @ ${formatPrice(Math.min(...prices))}` : ''}`;
  const description = truncate(
    `Explore ${count}${name} tour packages${fromPrice}. Customized ${name} holiday, honeymoon & family trips with hotels, sightseeing, transfers & 24/7 support by Exporio Holidays.`,
    160,
  );
  const keywords = uniq([
    `${name} tour packages`,
    `${name} holiday packages`,
    `${name} honeymoon packages`,
    `${name} family tour packages`,
    `${name} trip from India`,
    `best time to visit ${name}`,
    `cheap ${name} tour package`,
    ...tours.slice(0, 5).map((t) => t.title),
    SITE_NAME,
  ]);

  return pageMetadata({ title, description, path: `/location/${slug}/`, keywords, image: imageUrl || tours[0]?.imageUrl });
}

export function locationJsonLd(slug: string, name: string, tours: TourPackage[]) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `${name} Tour Packages`,
      url: absoluteUrl(`/location/${slug}/`),
      numberOfItems: tours.length,
      itemListElement: tours.map((t, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: absoluteUrl(`/tour/${t.slug}/`),
        name: t.title,
      })),
    },
    breadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: `${name} Tour Packages`, path: `/location/${slug}/` },
    ]),
  ];
}

/* ------------------------------------------------------------------ */
/* Blog posts                                                          */
/* ------------------------------------------------------------------ */

export function blogMetadata(blog: Blog): Metadata {
  const description = truncate(blog.content || blog.title, 160);
  return pageMetadata({
    title: blog.title,
    description,
    path: `/news/${blog.slug}/`,
    keywords: uniq([...blog.title.split(/[:,&|-]/).map((s) => s.trim()), 'travel guide', 'travel tips', SITE_NAME]),
    image: blog.image_url,
    type: 'article',
    publishedTime: blog.created_at,
  });
}

export function blogJsonLd(blog: Blog) {
  const url = absoluteUrl(`/news/${blog.slug}/`);
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: blog.title,
      description: truncate(blog.content || blog.title, 160),
      image: absoluteUrl(blog.image_url),
      url,
      mainEntityOfPage: url,
      datePublished: blog.created_at,
      author: { '@type': 'Person', name: blog.author },
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
        logo: { '@type': 'ImageObject', url: absoluteUrl(DEFAULT_OG_IMAGE) },
      },
    },
    breadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Travel Blog', path: '/news/' },
      { name: blog.title, path: `/news/${blog.slug}/` },
    ]),
  ];
}

/* ------------------------------------------------------------------ */
/* Site-wide                                                           */
/* ------------------------------------------------------------------ */

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function organizationJsonLd() {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'TravelAgency',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      slogan: siteConfig.tagline,
      url: SITE_URL,
      logo: absoluteUrl(DEFAULT_OG_IMAGE),
      image: absoluteUrl(DEFAULT_OG_IMAGE),
      telephone: siteConfig.phoneNumber,
      email: siteConfig.emailAddress,
      priceRange: '₹₹',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Madurai',
        addressRegion: 'Tamil Nadu',
        postalCode: '624220',
        addressCountry: 'IN',
      },
      areaServed: 'IN',
      sameAs: Object.values(siteConfig.socialLinks),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      publisher: { '@id': `${SITE_URL}/#organization` },
      inLanguage: 'en-IN',
    },
  ];
}
