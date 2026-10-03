'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getTours } from '@/lib/api';
import { TourPackage } from '@/types';
import TourPackageCard from '@/components/TourPackageCard';
import InquiryModal from '@/components/InquiryModal';
import { MapPin, ArrowLeft, SlidersHorizontal, X, SearchX } from 'lucide-react';
import { toursForLocation } from '@/lib/seo';
import { TOUR_TYPES, PRICE_RANGES, DURATION_RANGES } from '@/config/tourFacilities';

type Filters = { type: string; price: string; days: string };
const EMPTY: Filters = { type: '', price: '', days: '' };

function matches(tour: TourPackage, f: Filters): boolean {
  if (f.type && !tour.tourTypes?.includes(f.type)) return false;
  if (f.price) {
    const band = PRICE_RANGES.find((r) => r.key === f.price);
    // "Price on request" tours have no public price, so they can't match a price band
    if (!band || tour.showPrice === false || tour.price < band.min || tour.price > band.max) return false;
  }
  if (f.days) {
    const band = DURATION_RANGES.find((r) => r.key === f.days);
    if (!band || tour.durationDays < band.min || tour.durationDays > band.max) return false;
  }
  return true;
}

/** Read filters from the URL (?type=&price=&days=) so a filtered view can be shared. */
function filtersFromUrl(): Filters {
  const q = new URLSearchParams(window.location.search);
  const pick = (key: string, allowed: readonly { key: string }[]) => (allowed.some((a) => a.key === q.get(key)) ? q.get(key)! : '');
  return { type: pick('type', TOUR_TYPES), price: pick('price', PRICE_RANGES), days: pick('days', DURATION_RANGES) };
}

function FilterGroup({
  title,
  name,
  options,
  value,
  onChange,
  counts,
}: {
  title: string;
  name: string;
  options: readonly { key: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  counts: Record<string, number>;
}) {
  return (
    <fieldset>
      <legend className="w-full bg-white/[0.06] px-4 py-2.5 text-sm font-bold text-white">{title}</legend>
      <div className="px-4 py-3 flex flex-wrap gap-x-4 gap-y-2.5">
        {options.map((o) => (
          <label key={o.key} className={`flex items-center gap-2 text-xs sm:text-[13px] cursor-pointer ${counts[o.key] ? 'text-slate-200' : 'text-slate-500'}`}>
            <input
              type="radio"
              name={name}
              value={o.key}
              checked={value === o.key}
              onChange={() => onChange(o.key)}
              onClick={() => value === o.key && onChange('')} // click again to unselect
              className="w-4 h-4 accent-[#ff4e00] cursor-pointer"
            />
            {o.label}
            <span className="text-[10px] text-slate-500">({counts[o.key] ?? 0})</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function LocationTours({ slug, title, initialTours }: { slug: string; title: string; initialTours: TourPackage[] }) {
  // initialTours is rendered on the server (for SEO); refresh it in the browser
  const [tours, setTours] = useState<TourPackage[]>(initialTours);
  const [selectedTour, setSelectedTour] = useState<TourPackage | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function loadData() {
      const all = await getTours();
      if (all.length === 0) return;
      const filtered = toursForLocation(all, slug);
      setTours(filtered.length > 0 ? filtered : all);
    }
    loadData();
  }, [slug]);

  useEffect(() => {
    setFilters(filtersFromUrl());
  }, []);

  const update = (patch: Partial<Filters>) => {
    const next = { ...filters, ...patch };
    setFilters(next);
    const q = new URLSearchParams();
    if (next.type) q.set('type', next.type);
    if (next.price) q.set('price', next.price);
    if (next.days) q.set('days', next.days);
    window.history.replaceState(null, '', `${window.location.pathname}${q.toString() ? `?${q}` : ''}`);
  };

  const visible = useMemo(() => tours.filter((t) => matches(t, filters)), [tours, filters]);
  const active = !!(filters.type || filters.price || filters.days);

  // How many packages each option would show, given the other selected filters
  const counts = useMemo(() => {
    const count = (patch: Partial<Filters>) => tours.filter((t) => matches(t, { ...filters, ...patch })).length;
    return {
      type: Object.fromEntries(TOUR_TYPES.map((o) => [o.key, count({ type: o.key })])),
      price: Object.fromEntries(PRICE_RANGES.map((o) => [o.key, count({ price: o.key })])),
      days: Object.fromEntries(DURATION_RANGES.map((o) => [o.key, count({ days: o.key })])),
    };
  }, [tours, filters]);

  const filterPanel = (
    <div className="rounded-2xl overflow-hidden border border-slate-700/60 bg-navyDark/70 backdrop-blur-md">
      <div className="flex items-center justify-between bg-navyBlue px-4 py-3.5">
        <span className="flex items-center gap-2 text-base font-bold text-white">
          <SlidersHorizontal className="w-4 h-4 text-primaryCyan" /> Filter
        </span>
        <button type="button" onClick={() => update(EMPTY)} disabled={!active} className="text-xs font-bold text-primaryCyan hover:underline disabled:opacity-40 disabled:no-underline">
          Clear All
        </button>
      </div>
      <FilterGroup title="Tour Type" name="tour-type" options={TOUR_TYPES} value={filters.type} onChange={(type) => update({ type })} counts={counts.type} />
      <FilterGroup title="Price Range" name="price-range" options={PRICE_RANGES} value={filters.price} onChange={(price) => update({ price })} counts={counts.price} />
      <FilterGroup title="Tour Duration" name="tour-duration" options={DURATION_RANGES} value={filters.days} onChange={(days) => update({ days })} counts={counts.days} />
    </div>
  );

  return (
    <div className="py-12 relative min-h-screen bg-gradient-to-br from-navyDark via-navyBlue to-primaryCyan/20 text-white overflow-x-clip">
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

        <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-6 items-start">
          {/* Filters: sidebar on desktop, toggle on mobile */}
          <aside aria-label="Filter tour packages" className="lg:sticky lg:top-16">
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              aria-expanded={showFilters}
              className="lg:hidden w-full flex items-center justify-between rounded-xl border border-slate-700 bg-navyBlue px-4 py-3 text-sm font-bold mb-3"
            >
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-primaryCyan" /> Filters
                {active && <span className="text-[10px] bg-primaryCyan text-navyDark rounded-full px-2 py-0.5">On</span>}
              </span>
              {showFilters ? <X className="w-4 h-4" /> : <span className="text-xs text-slate-400">Show</span>}
            </button>
            <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>{filterPanel}</div>
          </aside>

          <section aria-label="Tour packages" className="min-w-0">
            <p className="text-xs text-slate-400 mb-4" aria-live="polite">
              Showing <strong className="text-white">{visible.length}</strong> of {tours.length} package{tours.length === 1 ? '' : 's'}
            </p>

            {visible.length === 0 ? (
              <div className="text-center bg-navyDark/60 border border-slate-700/50 rounded-2xl p-10">
                <SearchX className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                <h2 className="text-lg font-bold text-white mb-1">No packages match these filters</h2>
                <p className="text-sm text-slate-400 mb-4">Try a different tour type, price range or duration.</p>
                <button type="button" onClick={() => update(EMPTY)} className="text-xs font-bold bg-primaryCyan text-navyDark px-4 py-2 rounded-lg hover:brightness-110">
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {visible.map((t) => (
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
            )}
          </section>
        </div>
      </div>

      <InquiryModal tour={selectedTour} isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
