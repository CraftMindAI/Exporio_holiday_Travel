'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getBlogs } from '@/lib/supabase';
import { Blog } from '@/types';
import { ArrowLeft, Calendar, User } from 'lucide-react';

// Static fallback data for the hardcoded blog posts
const FALLBACK_BLOGS: Blog[] = [
  {
    id: '1',
    title: 'Top 10 Must-Visit Places in Sikkim & Gangtok for 2026',
    slug: 'top-10-places-in-sikkim',
    image_url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
    content: 'Sikkim is a beautiful destination in Northeast India. \n\nFrom the high-altitude Tsomgo Lake and Nathula Pass to the glass skywalk in Pelling, there is so much to explore. Ensure you book your permits in advance for restricted areas.',
    author: 'Exporio Travel Team',
    created_at: '2026-02-15T00:00:00.000Z',
  },
  {
    id: '2',
    title: 'Kashmir Tour Planning Guide: Best Time, Houseboats & Cable Cars',
    slug: 'kashmir-tour-planning-guide',
    image_url: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=800&q=80',
    content: 'Kashmir is truly the paradise on earth. \n\nWhen planning your trip, consider staying at least one night in a Dal Lake houseboat. Also, pre-book your Gulmarg Gondola tickets online to avoid long queues.',
    author: 'Priya Sharma',
    created_at: '2026-01-28T00:00:00.000Z',
  },
  {
    id: '3',
    title: 'How to Plan a Luxury Kerala Backwater Houseboat Vacation',
    slug: 'kerala-houseboat-vacation-guide',
    image_url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
    content: 'Kerala offers lush green landscapes and serene backwaters. \n\nSpend a couple of days in the tea gardens of Munnar before heading down to Alleppey for a private luxury houseboat experience.',
    author: 'Ankit Roy',
    created_at: '2026-01-10T00:00:00.000Z',
  }
];

export default function BlogPostPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBlog() {
      if (slug) {
        const dynamicBlogs = await getBlogs();
        const allBlogs = [...dynamicBlogs, ...FALLBACK_BLOGS];
        const found = allBlogs.find(b => b.slug === slug);
        setBlog(found || null);
      }
      setLoading(false);
    }
    loadBlog();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-navyDark via-[#1a1a4e] to-[#2d1b4e] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primaryCyan border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold">Loading Blog...</p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-navyDark via-[#1a1a4e] to-[#2d1b4e] py-20 px-4 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Blog Post Not Found</h2>
        <p className="text-slate-400 mb-6">The requested article could not be found.</p>
        <Link href="/news" className="bg-primaryCyan text-navyDark px-6 py-3 rounded-xl font-bold text-sm">
          Return to Blogs
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-navyDark to-navyBlue text-white relative">
      {/* Decorative Glow */}
      <div className="absolute top-[40vh] left-0 w-[500px] h-[500px] bg-primaryCyan/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Header */}
      <div className="relative w-full h-[40vh] md:h-[50vh] bg-gradient-to-b from-navyDark via-[#1a1a4e] to-[#2d1b4e]">
        <img 
          src={blog.image_url} 
          alt={blog.title} 
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navyDark via-navyDark/60 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col justify-end max-w-4xl mx-auto px-4 pb-12 z-10">
          <Link href="/news" className="inline-flex items-center gap-1.5 text-xs text-primaryCyan hover:text-white mb-6 font-bold transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Blogs
          </Link>
          
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4">
            {blog.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-300 font-semibold">
            <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primaryCyan" /> {blog.created_at ? new Date(blog.created_at).toLocaleDateString() : 'Recently'}</span>
            <span className="flex items-center gap-2"><User className="w-4 h-4 text-primaryCyan" /> By {blog.author}</span>
          </div>
        </div>
      </div>

      {/* Blog Content */}
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-16 relative z-10">
        <div className="prose prose-lg prose-invert max-w-none text-slate-300">
          {blog.content.split('\n').map((paragraph, idx) => (
            <p key={idx} className="mb-4 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
