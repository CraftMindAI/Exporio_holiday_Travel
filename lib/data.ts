// Server-only data access for pages, API routes and the sitemap, using the shared Prisma client.
// Rows are mapped to the app's existing TypeScript shapes in @/types.
import 'server-only';
import type { Tour as TourRow, Destination as DestinationRow, Blog as BlogRow } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { TourPackage, Destination, Blog } from '@/types';

const stringArray = (value: unknown): string[] => (Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : []);

export function tourFromRow(t: TourRow): TourPackage {
  return {
    id: t.id,
    title: t.title,
    slug: t.slug,
    description: t.description ?? undefined,
    destinationId: t.destinationId ?? undefined,
    location: t.location,
    category: t.category === 'international' ? 'international' : 'domestic',
    price: Number(t.price),
    originalPrice: t.originalPrice != null ? Number(t.originalPrice) : undefined,
    showPrice: t.showPrice,
    durationNights: t.durationNights,
    durationDays: t.durationDays,
    rating: Number(t.rating),
    reviewCount: t.reviewCount,
    imageUrl: t.imageUrl,
    highlights: stringArray(t.highlights),
    inclusions: stringArray(t.inclusions),
    exclusions: stringArray(t.exclusions),
    facilities: stringArray(t.facilities),
    tourTypes: stringArray(t.tourTypes),
    itinerary: Array.isArray(t.itinerary) ? (t.itinerary as unknown as TourPackage['itinerary']) : [],
    isFeatured: t.isFeatured,
    isTrending: t.isTrending,
  };
}

/** Tour as sent to the public site: a hidden price is removed from the data, not just from the screen. */
export function publicTourFromRow(t: TourRow): TourPackage {
  const tour = tourFromRow(t);
  return tour.showPrice ? tour : { ...tour, price: 0, originalPrice: undefined };
}

export function destinationFromRow(d: DestinationRow): Destination {
  return {
    id: d.id,
    name: d.name,
    slug: d.slug,
    category: d.category === 'international' ? 'international' : 'domestic',
    country: d.country ?? undefined,
    imageUrl: d.imageUrl,
    packageCount: d.packageCount,
    description: d.description ?? undefined,
  };
}

export function blogFromRow(b: BlogRow): Blog {
  return {
    id: b.id,
    title: b.title,
    slug: b.slug,
    image_url: b.imageUrl,
    content: b.content,
    author: b.author,
    created_at: b.createdAt.toISOString(),
  };
}

/** Log and fall back instead of crashing a public page when the database is unreachable. */
async function safely<T>(label: string, fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    // A static GitHub Pages build must fail rather than publish pages without their data
    if (process.env.STATIC_EXPORT) throw err;
    console.error(`[data] ${label} failed:`, err);
    return fallback;
  }
}

export function getAllTours(): Promise<TourPackage[]> {
  return safely('tours', async () => (await prisma.tour.findMany({ orderBy: { createdAt: 'desc' } })).map(publicTourFromRow), []);
}

export function getTourForSlug(slug: string): Promise<TourPackage | null> {
  return safely('tour', async () => {
    const row = await prisma.tour.findUnique({ where: { slug } });
    return row ? publicTourFromRow(row) : null;
  }, null);
}

export function getAllDestinations(): Promise<Destination[]> {
  return safely('destinations', async () => (await prisma.destination.findMany({ orderBy: { name: 'asc' } })).map(destinationFromRow), []);
}

/** All blog posts from the database, newest first. */
export function getAllBlogs(): Promise<Blog[]> {
  return safely('blogs', async () => (await prisma.blog.findMany({ orderBy: { createdAt: 'desc' } })).map(blogFromRow), []);
}

export function getBlogForSlug(slug: string): Promise<Blog | null> {
  return safely('blog', async () => {
    const row = await prisma.blog.findUnique({ where: { slug } });
    return row ? blogFromRow(row) : null;
  }, null);
}

export type MenuData = {
  places: { name: string; slug: string; category: string; country: string | null }[];
  packages: { title: string; slug: string; place: string | null }[];
};

/** Header navigation: places (Tour menu) and, per place, its tour packages (Place To Visit menu). */
export async function getMenu(): Promise<MenuData> {
  const [places, tours] = await Promise.all([
    prisma.destination.findMany({ orderBy: { name: 'asc' }, select: { name: true, slug: true, category: true, country: true } }),
    prisma.tour.findMany({
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      take: 200,
      select: { title: true, slug: true, location: true, destination: { select: { slug: true } } },
    }),
  ]);
  // Older tours may have no destination link; fall back to matching the location name
  const slugByName = new Map(places.map((p) => [p.name.trim().toLowerCase(), p.slug]));
  const packages = tours.map((t) => ({
    title: t.title,
    slug: t.slug,
    place: t.destination?.slug ?? slugByName.get(t.location.trim().toLowerCase()) ?? null,
  }));
  return { places, packages };
}

/** URL-safe slug from a title. */
export function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}
