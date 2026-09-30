'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, User, ArrowRight, ArrowLeft, BookOpen } from 'lucide-react';

import { getBlogs } from '@/lib/supabase';
import { Blog } from '@/types';

const STATIC_BLOGS = [
  {
    id: '1',
    title: 'Top 10 Must-Visit Places in Sikkim & Gangtok for 2026',
    slug: 'top-10-places-in-sikkim',
    category: 'Travel Guide',
    created_at: '2026-02-15T00:00:00.000Z',
    author: 'Exporio Travel Team',
    content: 'From high-altitude Tsomgo Lake and Nathula Pass to the skywalk in Pelling, explore the best tourist attractions in Sikkim.',
    image_url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '2',
    title: 'Kashmir Tour Planning Guide: Best Time, Houseboats & Cable Cars',
    slug: 'kashmir-tour-planning-guide',
    category: 'Kashmir Packages',
    created_at: '2026-01-28T00:00:00.000Z',
    author: 'Priya Sharma',
    content: 'Everything you need to know about booking Dal Lake houseboats, Gulmarg Gondola tickets, and visiting Betaab Valley.',
    image_url: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '3',
    title: 'How to Plan a Luxury Kerala Backwater Houseboat Vacation',
    slug: 'kerala-houseboat-vacation-guide',
    category: 'Honeymoon Deals',
    created_at: '2026-01-10T00:00:00.000Z',
    author: 'Ankit Roy',
    content: 'Experience serene tea gardens in Munnar and luxury private houseboats in Alleppey backwaters.',
    image_url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
  }
];

export default function BlogsPage() {
  const [blogs, setBlogs] = React.useState<Blog[]>([]);

  React.useEffect(() => {
    async function loadBlogs() {
      const dynamicBlogs = await getBlogs();
      // Combine dynamic blogs from DB with the static fallback blogs
      setBlogs([...dynamicBlogs, ...STATIC_BLOGS as Blog[]]);
    }
    loadBlogs();
  }, []);
  return (
    <div className="py-12 relative min-h-screen bg-gradient-to-br from-navyDark via-navyBlue to-primaryCyan/20 text-white overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] bg-primaryCyan/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-primaryCyan font-bold hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-primaryCyan bg-primaryCyan/10 px-3 py-1 rounded-full mb-3 border border-primaryCyan/20">
            <BookOpen className="w-4 h-4" /> Travel Insights & Guides
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-3">
            Exporio Travel Blogs
          </h1>
          <p className="text-slate-300 text-sm md:text-base">
            Expert travel tips, destination itineraries, and holiday advice from our local travel coordinators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogs.map((post) => (
            <Link href={`/news/${post.slug}`} key={post.id} className="bg-navyDark/60 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-card overflow-hidden flex flex-col group cursor-pointer hover:shadow-glow transition-all">
              <div className="relative h-48 overflow-hidden border-b border-slate-700/50">
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-4 text-slate-400 text-xs mb-2">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {post.created_at ? new Date(post.created_at).toLocaleDateString() : 'Recently'}</span>
                    <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {post.author}</span>
                  </div>

                  <h3 className="font-extrabold text-white text-base leading-snug mb-2 group-hover:text-primaryCyan transition-colors">
                    {post.title}
                  </h3>

                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed mb-4">
                    {post.content}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-700/50 flex items-center justify-between">
                  <span className="text-xs font-bold text-primaryCyan group-hover:underline flex items-center gap-1">
                    Read Article <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
