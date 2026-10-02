import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogPost from '@/components/BlogPost';
import JsonLd from '@/components/JsonLd';
import { getBlogForSlug } from '@/lib/data';
import { blogJsonLd, blogMetadata } from '@/lib/seo';

type Props = { params: Promise<{ slug: string }> };

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
