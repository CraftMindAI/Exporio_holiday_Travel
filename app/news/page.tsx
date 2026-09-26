'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, User, ArrowRight, ArrowLeft, BookOpen } from 'lucide-react';

const BLOG_ARTICLES = [
  {
    id: 1,
    title: 'Top 10 Must-Visit Places in Sikkim & Gangtok for 2026',
    slug: 'top-10-places-in-sikkim',
    category: 'Travel Guide',
    date: 'February 15, 2026',
    author: 'Exporio Travel Team',
    excerpt: 'From high-altitude Tsomgo Lake and Nathula Pass to the skywalk in Pelling, explore the best tourist attractions in Sikkim.',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 2,
    title: 'Kashmir Tour Planning Guide: Best Time, Houseboats & Cable Cars',
    slug: 'kashmir-tour-planning-guide',
    category: 'Kashmir Packages',
    date: 'January 28, 2026',
    author: 'Priya Sharma',
    excerpt: 'Everything you need to know about booking Dal Lake houseboats, Gulmarg Gondola tickets, and visiting Betaab Valley.',
    image: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 3,
    title: 'How to Plan a Luxury Kerala Backwater Houseboat Vacation',
    slug: 'kerala-houseboat-vacation-guide',
    category: 'Honeymoon Deals',
    date: 'January 10, 2026',
    author: 'Ankit Roy',
    excerpt: 'Experience serene tea gardens in Munnar and luxury private houseboats in Alleppey backwaters.',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
  }
];

export default function BlogsPage() {
  return (
    <div className="py-12 bg-lightBg min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-bold hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-3">
            <BookOpen className="w-4 h-4" /> Travel Insights & Guides
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-navyBlue tracking-tight mb-3">
            Exporio Travel Blogs
          </h1>
          <p className="text-steelGray text-sm md:text-base">
            Expert travel tips, destination itineraries, and holiday advice from our local travel coordinators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {BLOG_ARTICLES.map((post) => (
            <div key={post.id} className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden flex flex-col group">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-navyBlue/90 text-primaryCyan text-[11px] font-bold px-2.5 py-1 rounded-full">
                  {post.category}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-4 text-slate-400 text-xs mb-2">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {post.date}</span>
                    <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {post.author}</span>
                  </div>

                  <h3 className="font-extrabold text-navyBlue text-base leading-snug mb-2 group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-600 group-hover:underline flex items-center gap-1">
                    Read Article <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
