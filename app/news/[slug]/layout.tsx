import { getBlogs } from '@/lib/supabase';
import { staticNewsSlugs } from '@/config/staticRoutes';

export async function generateStaticParams() {
  const blogs = await getBlogs();
  const slugs = new Set([...staticNewsSlugs, ...blogs.map((blog) => blog.slug)]);

  return Array.from(slugs, (slug) => ({ slug }));
}

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
