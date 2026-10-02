import Link from 'next/link';
import { Calendar, User, ArrowRight, ArrowLeft, BookOpen, Phone, Mail, MapPin, Facebook, Instagram, Youtube, Globe2, Map, Headphones } from 'lucide-react';
import { siteConfig } from '@/config/siteConfig';
import { getAllBlogs } from '@/lib/data';
import { formatBlogDate } from '@/components/BlogPost';

// Rendered on the server from the blogs table and cached; publishing a blog refreshes it
export const revalidate = 300;

const ABOUT_POINTS = [
  { icon: Globe2, text: 'Domestic & international holiday packages' },
  { icon: Map, text: 'Itineraries customised to your dates and budget' },
  { icon: Headphones, text: '24/7 support before and during your trip' },
];

/** Fixed About Us panel beside the blog list. */
function AboutUs() {
  return (
    <aside aria-labelledby="about-us" className="lg:sticky lg:top-16 bg-navyDark/70 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 sm:p-6 shadow-card">
      <img src="/exporio-logo-white.png" alt="Exporio Holidays" className="h-10 w-auto mb-4" />
      <h2 id="about-us" className="text-lg font-black text-white mb-1">About Us</h2>
      <p className="text-[11px] font-extrabold uppercase tracking-widest text-primaryCyan mb-3">{siteConfig.tagline}</p>
      <p className="text-xs text-slate-300 leading-relaxed mb-4">
        Exporio Holidays is a tour and travel company crafting customised holiday experiences across domestic and international destinations,
        including Sikkim, Kashmir, Darjeeling, Kerala, Andaman, Bhutan, Bali and beyond.
      </p>

      <ul className="space-y-2.5 mb-5">
        {ABOUT_POINTS.map((p) => (
          <li key={p.text} className="flex items-start gap-2.5 text-xs text-slate-200">
            <p.icon className="w-4 h-4 text-primaryCyan flex-shrink-0 mt-0.5" />
            <span>{p.text}</span>
          </li>
        ))}
      </ul>

      <div className="border-t border-slate-700/60 pt-4 space-y-2.5 text-xs">
        <a href={siteConfig.phoneCallUrl} className="flex items-center gap-2.5 text-slate-200 hover:text-primaryCyan">
          <Phone className="w-4 h-4 text-primaryCyan flex-shrink-0" /> {siteConfig.phoneNumber}
        </a>
        <a href={`mailto:${siteConfig.emailAddress}`} className="flex items-center gap-2.5 text-slate-200 hover:text-primaryCyan break-all">
          <Mail className="w-4 h-4 text-primaryCyan flex-shrink-0" /> {siteConfig.emailAddress}
        </a>
        <p className="flex items-start gap-2.5 text-slate-300">
          <MapPin className="w-4 h-4 text-primaryCyan flex-shrink-0 mt-0.5" /> {siteConfig.headOfficeAddress}
        </p>
      </div>

      <div className="flex items-center gap-2 mt-4">
        {[
          { href: siteConfig.socialLinks.facebook, icon: Facebook, label: 'Facebook' },
          { href: siteConfig.socialLinks.instagram, icon: Instagram, label: 'Instagram' },
          { href: siteConfig.socialLinks.youtube, icon: Youtube, label: 'YouTube' },
        ].map((s) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noreferrer"
            aria-label={s.label}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-primaryCyan hover:text-white text-slate-300 flex items-center justify-center transition-colors"
          >
            <s.icon className="w-4 h-4" />
          </a>
        ))}
      </div>

      <Link
        href="/contact/"
        className="mt-5 flex items-center justify-center gap-2 w-full bg-primaryCyan text-white font-extrabold text-xs py-3 rounded-xl shadow-glow hover:brightness-110 transition-all"
      >
        Plan My Trip <ArrowRight className="w-4 h-4" />
      </Link>
    </aside>
  );
}

function excerpt(content: string, max = 180): string {
  const text = content.replace(/\s+/g, ' ').trim();
  return text.length <= max ? text : `${text.slice(0, max).replace(/\s+\S*$/, '')}…`;
}

export default async function BlogsPage() {
  const blogs = await getAllBlogs();

  // overflow-x-clip (not overflow-hidden) on the wrapper so the sticky About Us panel keeps working
  return (
    <div className="py-12 relative min-h-screen bg-gradient-to-br from-navyDark via-navyBlue to-primaryCyan/20 text-white overflow-x-clip">
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

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)] gap-6 lg:gap-8 items-start">
          <section aria-label="Blog posts">
          {blogs.length === 0 ? (
            <div className="text-center bg-navyDark/60 border border-slate-700/50 rounded-2xl p-10">
              <BookOpen className="w-10 h-10 text-slate-500 mx-auto mb-3" />
              <h2 className="text-lg font-bold text-white mb-1">No articles yet</h2>
              <p className="text-sm text-slate-400">New travel guides are on the way. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {blogs.map((post) => (
                <Link
                  href={`/news/${post.slug}/`}
                  key={post.id}
                  className="bg-navyDark/60 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-card overflow-hidden flex flex-col group cursor-pointer hover:shadow-glow transition-all"
                >
                  <div className="relative h-40 sm:h-48 overflow-hidden border-b border-slate-700/50 bg-slate-800">
                    <img
                      src={post.image_url}
                      alt={post.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 text-slate-400 text-[10px] sm:text-xs mb-2">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {formatBlogDate(post.created_at)}</span>
                        <span className="flex items-center gap-1"><User className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {post.author}</span>
                      </div>

                      <h2 className="font-extrabold text-white text-sm sm:text-base leading-snug mb-2 group-hover:text-primaryCyan transition-colors">
                        {post.title}
                      </h2>

                      <p className="text-[11px] sm:text-xs text-slate-300 line-clamp-3 leading-relaxed mb-3 sm:mb-4">
                        {excerpt(post.content)}
                      </p>
                    </div>

                    <div className="pt-2 sm:pt-3 border-t border-slate-700/50 flex items-center justify-between">
                      <span className="text-[11px] sm:text-xs font-bold text-primaryCyan group-hover:underline flex items-center gap-1">
                        Read Article <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          </section>

          <AboutUs />
        </div>
      </div>
    </div>
  );
}
