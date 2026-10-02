// Validation of admin form input for tours / destinations / blogs (server-only).
import 'server-only';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';
import { cleanText, optionalNumber, stringList } from '@/lib/http';
import { COUNTRIES } from '@/config/countries';
import { DAY_MEALS, MAX_TOUR_DAYS, TOUR_FACILITIES } from '@/config/tourFacilities';
import { prisma } from '@/lib/prisma';

/** Refresh the cached public pages after content changes. */
export function refreshSite() {
  revalidatePath('/', 'layout');
}

type Body = Record<string, unknown>;

/** An image reference we accept: a full http(s) URL or an uploaded "/media/<file>" path. */
const isImageRef = (v: string) => /^https?:\/\/\S+$/.test(v) || /^\/media\/[A-Za-z0-9_-]+\.(jpg|jpeg|png|webp|gif|avif)$/i.test(v);

const has = (body: Body, key: string) => Object.prototype.hasOwnProperty.call(body, key);
const category = (v: unknown) => (v === 'international' ? 'international' : 'domestic');

/** Tour fields from a request body; on update only the keys present are returned. */
export async function tourInput(body: Body, mode: 'create' | 'update'): Promise<{ data?: Prisma.TourUncheckedUpdateInput; error?: string }> {
  const data: Prisma.TourUncheckedUpdateInput = {};
  const want = (key: string) => mode === 'create' || has(body, key);

  if (want('title')) {
    const title = cleanText(body.title, 255);
    if (!title) return { error: 'Title is required.' };
    data.title = title;
  }

  // Location & category always come from the chosen place (destinations table)
  if (want('destinationId')) {
    const destinationId = cleanText(body.destinationId, 36);
    const destination = destinationId ? await prisma.destination.findUnique({ where: { id: destinationId } }) : null;
    if (!destination) return { error: 'Select the location / destination for this tour.' };
    data.destinationId = destination.id;
    data.location = destination.country ? `${destination.name}, ${destination.country}` : destination.name;
    data.category = destination.category === 'international' ? 'international' : 'domestic';
  }

  if (has(body, 'description')) data.description = cleanText(body.description, 20_000) || null;
  if (want('price')) {
    const price = optionalNumber(body.price);
    if (price === undefined || price < 0) return { error: 'Enter a valid price.' };
    data.price = price;
  }
  if (has(body, 'originalPrice')) data.originalPrice = optionalNumber(body.originalPrice) ?? null;

  // Nights are always one less than days
  let days: number | undefined;
  if (want('durationDays')) {
    days = Math.round(optionalNumber(body.durationDays) ?? 0);
    if (days < 1 || days > MAX_TOUR_DAYS) return { error: `Number of days must be between 1 and ${MAX_TOUR_DAYS}.` };
    data.durationDays = days;
    data.durationNights = days - 1;
  }

  if (has(body, 'rating')) data.rating = Math.min(5, Math.max(0, optionalNumber(body.rating) ?? 5));
  if (has(body, 'reviewCount')) data.reviewCount = Math.max(0, Math.round(optionalNumber(body.reviewCount) ?? 0));
  if (want('imageUrl')) {
    const imageUrl = cleanText(body.imageUrl, 2000);
    if (!isImageRef(imageUrl)) return { error: 'Upload a cover image or paste an image URL for the tour.' };
    data.imageUrl = imageUrl;
  }
  if (has(body, 'highlights')) data.highlights = stringList(body.highlights, 30);
  if (has(body, 'inclusions')) data.inclusions = stringList(body.inclusions, 50);
  if (has(body, 'exclusions')) data.exclusions = stringList(body.exclusions, 50);
  if (has(body, 'facilities')) {
    const allowed = new Set<string>(TOUR_FACILITIES.map((f) => f.key));
    data.facilities = stringList(body.facilities, 10).filter((f) => allowed.has(f));
  }
  if (has(body, 'itinerary')) {
    const raw = Array.isArray(body.itinerary) ? body.itinerary : [];
    const limit = days ?? MAX_TOUR_DAYS;
    const meals = new Set<string>(DAY_MEALS);
    data.itinerary = raw.slice(0, limit).map((item: any, i: number) => ({
      day: i + 1,
      title: cleanText(item?.title, 200),
      description: cleanText(item?.description, 5000),
      places: stringList(item?.places, 20, 120),
      meals: stringList(item?.meals, 3).filter((m) => meals.has(m)),
      stay: cleanText(item?.stay, 200),
    }));
  }
  if (has(body, 'isFeatured')) data.isFeatured = !!body.isFeatured;
  if (has(body, 'isTrending')) data.isTrending = !!body.isTrending;
  return { data };
}

/** True if another place (case-insensitive) already uses this name. */
export async function destinationNameTaken(name: string, exceptId?: string): Promise<boolean> {
  const existing = await prisma.destination.findFirst({ where: { name, ...(exceptId ? { NOT: { id: exceptId } } : {}) }, select: { id: true } });
  return !!existing;
}

/** True for Prisma unique-constraint errors (P2002). */
export function isUniqueViolation(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002';
}

export function destinationInput(body: Body, mode: 'create' | 'update'): { data?: Prisma.DestinationUpdateInput; error?: string } {
  const data: Prisma.DestinationUpdateInput = {};
  const want = (key: string) => mode === 'create' || has(body, key);

  if (want('name')) {
    const name = cleanText(body.name, 255);
    if (!name) return { error: 'Name is required.' };
    data.name = name;
  }
  if (want('category')) {
    data.category = category(body.category);
    // International places need a country from the list; domestic places have none
    if (data.category === 'international') {
      const country = cleanText(body.country, 100);
      if (!(COUNTRIES as readonly string[]).includes(country)) return { error: 'Select a country for the international place.' };
      data.country = country;
    } else {
      data.country = null;
    }
  }
  if (want('imageUrl')) {
    const imageUrl = cleanText(body.imageUrl, 2000);
    if (!isImageRef(imageUrl)) return { error: 'Add an image for the place.' };
    data.imageUrl = imageUrl;
  }
  if (has(body, 'packageCount')) data.packageCount = Math.max(0, Math.round(optionalNumber(body.packageCount) ?? 0));
  if (has(body, 'description')) data.description = cleanText(body.description, 5000) || null;
  return { data };
}

export function blogInput(body: Body, mode: 'create' | 'update'): { data?: Prisma.BlogUpdateInput; error?: string } {
  const data: Prisma.BlogUpdateInput = {};
  const want = (key: string) => mode === 'create' || has(body, key);

  if (want('title')) {
    const title = cleanText(body.title, 255);
    if (!title) return { error: 'Title is required.' };
    data.title = title;
  }
  if (want('author')) {
    const author = cleanText(body.author, 150);
    if (!author) return { error: 'Author is required.' };
    data.author = author;
  }
  if (want('content')) {
    const content = cleanText(body.content, 200_000);
    if (!content) return { error: 'Content is required.' };
    data.content = content;
  }
  if (want('imageUrl')) {
    const imageUrl = cleanText(body.imageUrl, 2000);
    if (!isImageRef(imageUrl)) return { error: 'Upload a cover image or paste an image URL for the blog.' };
    data.imageUrl = imageUrl;
  }
  return { data };
}

/** A slug that isn't taken yet: base, base-2, base-3, ... */
export async function uniqueSlug(base: string, exists: (slug: string) => Promise<boolean>): Promise<string> {
  const root = base || 'item';
  for (let i = 1; ; i++) {
    const slug = i === 1 ? root : `${root}-${i}`;
    if (!(await exists(slug))) return slug;
  }
}

/** True for Prisma "record not found" errors (P2025). */
export function isNotFound(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025';
}
