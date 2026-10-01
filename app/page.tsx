'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Sparkles, Mountain, Palmtree, Castle, TreePine, Umbrella, Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import { TourPackage } from '@/types';
import { getTours } from '@/lib/supabase';

// Lazy loaded components
const HeroBanner = dynamic(() => import('@/components/HeroBanner'), { ssr: false });
const TourPackageCard = dynamic(() => import('@/components/TourPackageCard'), { ssr: false });
const PopularDestinations = dynamic(() => import('@/components/PopularDestinations'), { ssr: false });
const Testimonials = dynamic(() => import('@/components/Testimonials'), { ssr: false });
const InquiryModal = dynamic(() => import('@/components/InquiryModal'), { ssr: false });

// Destination display name mapping
const DESTINATION_NAMES: Record<string, string> = {
  'andamantourpackage': 'Andaman',
  'darjeelingtourpackages': 'Darjeeling',
  'gangtoktourpackage': 'Gangtok',
  'shimlamanalitourpackage': 'Shimla Manali',
  'kashmirtourpackage': 'Kashmir',
  'kerala-tour-packages': 'Kerala',
  'bhutan-tour-packages': 'Bhutan',
  'thailand-tour-package': 'Thailand',
  'bali-tour-packages': 'Bali',
  'maldives-tour-package': 'Maldives',
  'sikkim-tour-package': 'Sikkim',
  'leh-ladakh-package': 'Leh Ladakh',
  'lakshadweep-tour-packages': 'Lakshadweep',
  'uttarakhand-tour-package': 'Uttarakhand',
  'spiti-valley-tour-packages': 'Spiti Valley',
  'himachal-tour-package': 'Himachal Pradesh',
  'rajasthan-tour-packages': 'Rajasthan',
};

// Destination icons (Lucide arrow-style icons)
const DESTINATION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'andamantourpackage': Umbrella,
  'darjeelingtourpackages': Mountain,
  'gangtoktourpackage': Mountain,
  'shimlamanalitourpackage': Mountain,
  'kashmirtourpackage': Mountain,
  'kerala-tour-packages': Palmtree,
  'bhutan-tour-packages': TreePine,
  'thailand-tour-package': Palmtree,
  'bali-tour-packages': Palmtree,
  'maldives-tour-package': Umbrella,
  'sikkim-tour-package': Mountain,
  'leh-ladakh-package': Mountain,
  'lakshadweep-tour-packages': Umbrella,
  'uttarakhand-tour-package': Mountain,
  'spiti-valley-tour-packages': Mountain,
  'himachal-tour-package': Mountain,
  'rajasthan-tour-packages': Castle,
};

function DestinationSection({
  location,
  tours,
  displayName,
  Icon,
  onEnquire,
}: {
  location: string;
  tours: TourPackage[];
  displayName: string;
  Icon: React.ComponentType<{ className?: string }>;
  onEnquire: (tour: TourPackage) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  return (
    <div className="mb-12 last:mb-0">
      {/* Destination Header with Arrows */}
      <div className="flex items-center justify-between mb-6 border-b border-slate-700 pb-3">
        <div className="flex items-center gap-3">
          <Icon className="w-6 h-6 text-primaryCyan" />
          <h3 className="text-xl font-bold text-white">{displayName}</h3>
          <span className="text-xs font-semibold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full">
            {tours.length} package{tours.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Left / Right Arrow Icons */}
        <div className="flex items-center gap-2">
          <ChevronLeft onClick={scrollLeft} className="w-5 h-5 text-slate-300 hover:text-primaryCyan cursor-pointer transition-colors" />
          <ChevronRight onClick={scrollRight} className="w-5 h-5 text-slate-300 hover:text-primaryCyan cursor-pointer transition-colors" />
        </div>
      </div>

      {/* Horizontal Slider for this Destination */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {tours.map((tour) => (
          <div key={tour.id} className="min-w-[300px] sm:min-w-[320px] snap-start">
            <TourPackageCard tour={tour} onEnquire={onEnquire} />
          </div>
        ))}
      </div>
    </div>
  );
}

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

  // Group tours by destination/location
  const toursByDestination = useMemo(() => {
    const grouped: Record<string, TourPackage[]> = {};
    filteredTours.forEach((tour) => {
      const key = tour.location;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(tour);
    });
    return grouped;
  }, [filteredTours]);

  // Sort destinations: domestic first, then international
  const sortedDestinations = useMemo(() => {
    const destinations = Object.keys(toursByDestination);
    return destinations.sort((a, b) => {
      const aIsDomestic = !['thailand-tour-package', 'bali-tour-packages', 'maldives-tour-package'].includes(a);
      const bIsDomestic = !['thailand-tour-package', 'bali-tour-packages', 'maldives-tour-package'].includes(b);
      if (aIsDomestic && !bIsDomestic) return -1;
      if (!aIsDomestic && bIsDomestic) return 1;
      return a.localeCompare(b);
    });
  }, [toursByDestination]);

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
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all touch-manipulation ${activeTab === 'all'
                  ? 'bg-primaryCyan text-navyDark shadow'
                  : 'text-slate-300 hover:text-white'
                  }`}
              >
                All Packages
              </button>
              <button
                onClick={() => handleTabChange('domestic')}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all touch-manipulation ${activeTab === 'domestic'
                  ? 'bg-primaryCyan text-navyDark shadow'
                  : 'text-slate-300 hover:text-white'
                  }`}
              >
                Domestic (India)
              </button>
              <button
                onClick={() => handleTabChange('international')}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all touch-manipulation ${activeTab === 'international'
                  ? 'bg-primaryCyan text-navyDark shadow'
                  : 'text-slate-300 hover:text-white'
                  }`}
              >
                International
              </button>
            </div>
          </div>

          {/* Tours Grouped by Destination */}
          {sortedDestinations.map((location) => (
            <DestinationSection
              key={location}
              location={location}
              tours={toursByDestination[location]}
              displayName={DESTINATION_NAMES[location] || location}
              Icon={DESTINATION_ICONS[location] || MapPin}
              onEnquire={openInquiry}
            />
          ))}
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
