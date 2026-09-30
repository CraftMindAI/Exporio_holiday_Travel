'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getTours } from '@/lib/supabase';
import { TourPackage } from '@/types';
import TourPackageCard from '@/components/TourPackageCard';
import InquiryModal from '@/components/InquiryModal';
import { MapPin, ArrowLeft } from 'lucide-react';

export default function LocationPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [tours, setTours] = useState<TourPackage[]>([]);
  const [selectedTour, setSelectedTour] = useState<TourPackage | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      const all = await getTours();
      if (slug) {
        // filter by location slug
        const filtered = all.filter(
          (t) => t.slug.includes(slug) || slug.includes(t.slug) || t.location.toLowerCase().includes(slug.split('-')[0])
        );
        setTours(filtered.length > 0 ? filtered : all);
      } else {
        setTours(all);
      }
    }
    loadData();
  }, [slug]);

  const locationTitle = slug
    ? slug.replace(/-/g, ' ').replace('tour package', '').replace('packages', '').toUpperCase()
    : 'ALL DESTINATIONS';

  return (
    <div className="py-12 relative min-h-screen bg-gradient-to-br from-navyDark via-navyBlue to-primaryCyan/20 text-white overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primaryCyan/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-primaryCyan font-bold hover:underline mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="mb-8 border-b border-slate-700/50 pb-6">
          <div className="flex items-center gap-2 text-primaryCyan text-xs font-extrabold uppercase tracking-wider mb-1">
            <MapPin className="w-4 h-4" /> Explore Destination
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">
            {locationTitle} TOUR PACKAGES
          </h1>
          <p className="text-slate-300 text-sm mt-2">
            Browse carefully selected holiday itineraries with transparent pricing and 24/7 on-trip assistance.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
