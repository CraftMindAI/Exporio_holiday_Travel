'use client';

import React, { useState, useEffect } from 'react';
import HeroBanner from '@/components/HeroBanner';
import PopularDestinations from '@/components/PopularDestinations';
import TourPackageCard from '@/components/TourPackageCard';
import Testimonials from '@/components/Testimonials';
import InquiryModal from '@/components/InquiryModal';
import { TourPackage } from '@/types';
import { getTours } from '@/lib/supabase';
import { Compass, Sparkles, Globe } from 'lucide-react';

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
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Handcrafted Holiday Packages</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-navyBlue tracking-tight">
                Featured Tour Packages
              </h2>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center bg-slate-100 p-1.5 rounded-xl text-xs font-extrabold">
              <button
                onClick={() => handleTabChange('all')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'all'
                    ? 'bg-navyBlue text-white shadow'
                    : 'text-slate-600 hover:text-navyBlue'
                }`}
              >
                All Packages
              </button>
              <button
                onClick={() => handleTabChange('domestic')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'domestic'
                    ? 'bg-navyBlue text-white shadow'
                    : 'text-slate-600 hover:text-navyBlue'
                }`}
              >
                Domestic (India)
              </button>
              <button
                onClick={() => handleTabChange('international')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'international'
                    ? 'bg-navyBlue text-white shadow'
                    : 'text-slate-600 hover:text-navyBlue'
                }`}
              >
                International
              </button>
            </div>
          </div>

          {/* Domestic Tours */}
          {(activeTab === 'all' || activeTab === 'domestic') && (
            <div className="mb-16">
              <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-3">
                <Compass className="w-5 h-5 text-blue-600" />
                <h3 className="text-xl font-bold text-navyBlue">Top India Domestic Packages</h3>
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
              <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-3">
                <Globe className="w-5 h-5 text-blue-600" />
                <h3 className="text-xl font-bold text-navyBlue">International Holiday Deals</h3>
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
