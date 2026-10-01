'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Compass, Sparkles, Globe } from 'lucide-react';
import { TourPackage } from '@/types';
import { getTours } from '@/lib/supabase';

// Lazy loaded components
const HeroBanner = dynamic(() => import('@/components/HeroBanner'), { ssr: false });
const TourPackageCard = dynamic(() => import('@/components/TourPackageCard'), { ssr: false });
const PopularDestinations = dynamic(() => import('@/components/PopularDestinations'), { ssr: false });
const Testimonials = dynamic(() => import('@/components/Testimonials'), { ssr: false });
const InquiryModal = dynamic(() => import('@/components/InquiryModal'), { ssr: false });

export default function HomePage() {
  const [tours, setTours] = useState<TourPackage[]>([]);
  const [filteredTours, setFilteredTours] = useState<TourPackage[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'domestic' | 'international'>('all');
  const [selectedTourForInquiry, setSelectedTourForInquiry] = useState<TourPackage | null>(null);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);

  // Inactivity popup timer (2 minutes)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        // Only show if it's not already open
        setInquiryModalOpen((prev) => {
          if (!prev) {
            setSelectedTourForInquiry(null);
            return true;
          }
          return prev;
        });
      }, 10000); // 10,000 ms = 10 seconds
    };

    resetTimer(); // Start the timer when the page loads

    // Reset the timer on any user interaction
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    events.forEach((event) => document.addEventListener(event, resetTimer));

    return () => {
      clearTimeout(timeoutId);
      events.forEach((event) => document.removeEventListener(event, resetTimer));
    };
  }, []);

  useEffect(() => {
    async function loadData() {
      const data = await getTours();
      setTours(data);
      setFilteredTours(data);
    }
    loadData();
  }, []);

  const handleSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setFilteredTours(tours);
      return;
    }
    const lower = searchTerm.toLowerCase();
    const filtered = tours.filter(
      (t) =>
        t.title.toLowerCase().includes(lower) ||
        t.location.toLowerCase().includes(lower) ||
        t.highlights.some((h) => h.toLowerCase().includes(lower))
    );
    setFilteredTours(filtered);
  };

  const handleTabChange = (tab: 'all' | 'domestic' | 'international') => {
    setActiveTab(tab);
    if (tab === 'all') {
      setFilteredTours(tours);
    } else {
      setFilteredTours(tours.filter((t) => t.category === tab));
    }
  };

  const openInquiry = (tour: TourPackage) => {
    setSelectedTourForInquiry(tour);
    setInquiryModalOpen(true);
  };

  const domesticTours = filteredTours.filter((t) => t.category === 'domestic');
  const internationalTours = filteredTours.filter((t) => t.category === 'international');

  return (
    <>
      {/* Hero Banner Section */}
      <HeroBanner onSearch={handleSearch} />

      {/* Popular Destinations */}
      <PopularDestinations />

      {/* Main Tour Packages Showcase */}
      <section className="py-12 sm:py-16 relative overflow-hidden bg-gradient-to-bl from-navyDark via-navyBlue to-primaryCyan/20 text-white">
        {/* Decorative Glow */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-primaryCyan/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-extrabold text-primaryCyan bg-primaryCyan/10 px-3 py-1 rounded-full uppercase tracking-wider mb-2">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Handcrafted Holiday Packages</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                Featured Tour Packages
              </h2>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap items-center justify-center bg-slate-800 p-1 sm:p-1.5 rounded-xl text-[10px] sm:text-xs font-extrabold gap-1">
              <button
                onClick={() => handleTabChange('all')}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all touch-manipulation ${
                  activeTab === 'all'
                    ? 'bg-primaryCyan text-navyDark shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                All Packages
              </button>
              <button
                onClick={() => handleTabChange('domestic')}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all touch-manipulation ${
                  activeTab === 'domestic'
                    ? 'bg-primaryCyan text-navyDark shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Domestic (India)
              </button>
              <button
                onClick={() => handleTabChange('international')}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all touch-manipulation ${
                  activeTab === 'international'
                    ? 'bg-primaryCyan text-navyDark shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                International
              </button>
            </div>
          </div>

          {/* Domestic Tours */}
          {(activeTab === 'all' || activeTab === 'domestic') && (
            <div className="mb-16">
              <div className="flex items-center gap-2 mb-6 border-b border-slate-700 pb-3">
                <Compass className="w-5 h-5 text-primaryCyan" />
                <h3 className="text-xl font-bold text-white">Top India Domestic Packages</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {domesticTours.map((tour) => (
                  <TourPackageCard key={tour.id} tour={tour} onEnquire={openInquiry} />
                ))}
              </div>
            </div>
          )}

          {/* International Tours */}
          {(activeTab === 'all' || activeTab === 'international') && (
            <div>
              <div className="flex items-center gap-2 mb-6 border-b border-slate-700 pb-3">
                <Globe className="w-5 h-5 text-primaryCyan" />
                <h3 className="text-xl font-bold text-white">International Holiday Deals</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {internationalTours.map((tour) => (
                  <TourPackageCard key={tour.id} tour={tour} onEnquire={openInquiry} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* Global Inquiry Modal */}
      <InquiryModal
        tour={selectedTourForInquiry}
        isOpen={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
      />
    </>
  );
}
