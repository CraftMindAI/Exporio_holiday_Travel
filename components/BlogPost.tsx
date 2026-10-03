import Link from 'next/link';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { Blog } from '@/types';

export function formatBlogDate(value?: string): string {
  return value ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Recently';
}

/** A single blog post, rendered on the server from the blogs table. */
export default function BlogPost({ blog }: { blog: Blog }) {
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
            <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primaryCyan" /> {formatBlogDate(blog.created_at)}</span>
            <span className="flex items-center gap-2"><User className="w-4 h-4 text-primaryCyan" /> By {blog.author}</span>
          </div>
        </div>
      </div>

      {/* Blog Content */}
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-16 relative z-10">
        <div className="prose prose-lg prose-invert max-w-none text-slate-300 [overflow-wrap:anywhere]">
          {blog.content
            .split('\n')
            .filter((paragraph) => paragraph.trim())
            .map((paragraph, idx) => (
              <p key={idx} className="mb-4 leading-relaxed">
                {paragraph}
              </p>
            ))}
        </div>
      </div>
    </div>
  );
}
