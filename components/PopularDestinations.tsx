'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Send, ChevronLeft, ChevronRight } from 'lucide-react';
import { getDestinations } from '@/lib/api';
import { Destination } from '@/types';
import { mediaUrl } from '@/lib/routes';

export default function PopularDestinations() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadDestinations() {
      const data = await getDestinations();
      setDestinations(data);
      setLoading(false);
    }
    loadDestinations();
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollAmount = clientWidth > 600 ? clientWidth / 2 : clientWidth; 
      scrollContainerRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-16 relative overflow-hidden bg-gradient-to-br from-navyDark via-navyBlue to-primaryCyan/20 text-white">
      {/* Decorative Glow based on logo orange */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primaryCyan/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primaryCyan/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center justify-center gap-2 mb-2">
            Best Tour and Travel Company in India
            <Send className="w-6 h-6 text-primaryCyan -rotate-45" />
          </h2>
          <p className="text-slate-300 text-sm md:text-base font-medium">
            40000+ Tourists have already travelled with us!
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#122a7f]"></div>
          </div>
        ) : (
          /* Slider Container */
          <div className="relative group">
            {/* Left Arrow */}
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-3 md:-translate-x-6 z-10 bg-white/90 shadow-[0_4px_12px_rgba(0,0,0,0.1)] p-2 sm:p-3 rounded-full text-[#122a7f] hover:bg-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100 hidden sm:block focus:outline-none"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Scrollable Track */}
            <div 
              ref={scrollContainerRef}
              className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-6 pt-2 scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {/* Hide webkit scrollbar via inline styles workaround or global css. Using tailwind utilities usually requires a plugin, so inline style is a fallback. */}
              <style dangerouslySetInnerHTML={{__html: `
                .hide-scrollbar::-webkit-scrollbar { display: none; }
              `}} />
              
              {destinations.map((dest) => (
                <div key={dest.id} className="min-w-[260px] sm:min-w-[280px] md:min-w-[300px] snap-start shrink-0 hide-scrollbar">
                  <Link
                    href={`/location/${dest.slug}`}
                    className="group relative h-64 sm:h-72 md:h-80 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 block bg-slate-100 w-full"
                  >
                    {/* Background Image */}
                    <img
                      src={mediaUrl(dest.imageUrl)}
                      alt={dest.name}
                      className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
                    />
                    {/* Overlay Gradient at Bottom */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Title */}
                    <div className="absolute bottom-4 left-0 right-0 px-4 text-center">
                      <h3 className="text-base md:text-xl font-bold text-white tracking-wide drop-shadow-lg">
                        {dest.name}
                      </h3>

                    </div>
                  </Link>
                </div>
              ))}
            </div>

            {/* Right Arrow */}
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-3 md:translate-x-6 z-10 bg-white/90 shadow-[0_4px_12px_rgba(0,0,0,0.1)] p-2 sm:p-3 rounded-full text-[#122a7f] hover:bg-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100 hidden sm:block focus:outline-none"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
