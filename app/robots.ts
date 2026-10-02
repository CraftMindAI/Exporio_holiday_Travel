import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

// Static robots.txt
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin/', '/auth/', '/subscribe/'] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
