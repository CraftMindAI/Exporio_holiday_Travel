import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogPost from '@/components/BlogPost';
import JsonLd from '@/components/JsonLd';
import { getAllBlogs, getBlogForSlug } from '@/lib/data';
import { blogJsonLd, blogMetadata } from '@/lib/seo';

type Props = { params: Promise<{ slug: string }> };

/** Static GitHub Pages build: pre-render every blog post. On Hostinger pages render on demand. */
export async function generateStaticParams() {
  if (!process.env.STATIC_EXPORT) return [];
  const slugs = (await getAllBlogs()).map((b) => ({ slug: b.slug }));
  return slugs.length ? slugs : [{ slug: 'none' }]; // a static export needs at least one page
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const blog = await getBlogForSlug((await params).slug);
  if (!blog) return { title: 'Blog Post Not Found', robots: { index: false } };
  return blogMetadata(blog);
}

export default async function BlogPostPage({ params }: Props) {
  const blog = await getBlogForSlug((await params).slug);
  if (!blog) notFound();

  return (
    <>
      <JsonLd data={blogJsonLd(blog)} />
      <BlogPost blog={blog} />
    </>
  );
}
