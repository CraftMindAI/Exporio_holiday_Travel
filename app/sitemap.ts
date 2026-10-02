import type { MetadataRoute } from 'next';
import { getAllBlogs, getAllDestinations, getAllTours } from '@/lib/data';
import { staticTourSlugs } from '@/config/staticRoutes';
import { absoluteUrl } from '@/lib/seo';

// Built from the database on request and cached for an hour
export const revalidate = 3600;
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [tours, destinations, blogs] = await Promise.all([getAllTours(), getAllDestinations(), getAllBlogs()]);
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: absoluteUrl('/contact/'), lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: absoluteUrl('/news/'), lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: absoluteUrl('/stranger-trip/'), lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
  ];

  const locationSlugs = new Set([...staticTourSlugs, ...destinations.map((d) => d.slug)]);
  const locationPages: MetadataRoute.Sitemap = Array.from(locationSlugs, (slug) => ({
    url: absoluteUrl(`/location/${slug}/`),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  const tourSlugs = new Set(staticTourSlugs);
  const tourPages: MetadataRoute.Sitemap = tours.map((tour) => {
    tourSlugs.delete(tour.slug);
    return {
      url: absoluteUrl(`/tour/${tour.slug}/`),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: tour.isFeatured ? 0.9 : 0.8,
      images: tour.imageUrl ? [absoluteUrl(tour.imageUrl)] : undefined,
    };
  });
  // Static slugs that aren't in the database (e.g. when the database is unreachable)
  tourSlugs.forEach((slug) => tourPages.push({ url: absoluteUrl(`/tour/${slug}/`), lastModified: now, priority: 0.8 }));

  const blogPages: MetadataRoute.Sitemap = blogs.map((blog) => {
    return {
      url: absoluteUrl(`/news/${blog.slug}/`),
      lastModified: blog.created_at ? new Date(blog.created_at) : now,
      changeFrequency: 'monthly',
      priority: 0.5,
    };
  });

  return [...staticPages, ...locationPages, ...tourPages, ...blogPages];
}
