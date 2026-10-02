'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getTours } from '@/lib/api';
import { TourPackage } from '@/types';
import TourPackageCard from '@/components/TourPackageCard';
import InquiryModal from '@/components/InquiryModal';
import { MapPin, ArrowLeft } from 'lucide-react';
import { toursForLocation } from '@/lib/seo';

export default function LocationTours({ slug, title, initialTours }: { slug: string; title: string; initialTours: TourPackage[] }) {
  // initialTours is rendered into the static HTML at build time (for SEO); refresh it in the browser
  const [tours, setTours] = useState<TourPackage[]>(initialTours);
  const [selectedTour, setSelectedTour] = useState<TourPackage | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      const all = await getTours();
      if (all.length === 0) return;
      const filtered = toursForLocation(all, slug);
      setTours(filtered.length > 0 ? filtered : all);
    }
    loadData();
  }, [slug]);

  return (
    <div className="py-12 relative min-h-screen bg-gradient-to-br from-navyDark via-navyBlue to-primaryCyan/20 text-white overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primaryCyan/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-primaryCyan font-bold hover:underline mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="mb-6 sm:mb-8 border-b border-slate-700/50 pb-4 sm:pb-6">
          <div className="flex items-center gap-2 text-primaryCyan text-[10px] sm:text-xs font-extrabold uppercase tracking-wider mb-1">
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Explore Destination
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">
            {title.toUpperCase()} TOUR PACKAGES
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 sm:mt-2">
            Browse carefully selected holiday itineraries with transparent pricing and 24/7 on-trip assistance.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {tours.map((t) => (
            <TourPackageCard
              key={t.id}
              tour={t}
              onEnquire={(tour) => {
                setSelectedTour(tour);
                setModalOpen(true);
              }}
            />
          ))}
        </div>
      </div>

      <InquiryModal
        tour={selectedTour}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
