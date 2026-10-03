'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getTourBySlug } from '@/lib/api';
import { TourPackage } from '@/types';
import InquiryModal from '@/components/InquiryModal';
import { Star, Clock, MapPin, CheckCircle2, XCircle, Hotel, Utensils, Car, Compass, Calendar, ChevronDown, Phone, Send, ArrowLeft, BedDouble, Navigation } from 'lucide-react';
import { TOUR_FACILITIES } from '@/config/tourFacilities';
import { FACILITY_ICONS } from '@/components/tourFacilityIcons';
import { submitInquiry } from '@/lib/api';
import { toast } from '@/lib/toast';
import { markInquirySubmitted } from '@/lib/inquiryStatus';

export default function TourDetail({ slug, initialTour }: { slug: string; initialTour: TourPackage | null }) {
  // initialTour is rendered into the static HTML at build time (for SEO); refresh it in the browser
  const [tour, setTour] = useState<TourPackage | null>(initialTour);
  const [loading, setLoading] = useState(!initialTour);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [openDays, setOpenDays] = useState<number[]>([1]);
  const toggleDay = (day: number) => setOpenDays((d) => (d.includes(day) ? d.filter((x) => x !== day) : [...d, day]));

  // Quick Inline Lead Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadTour() {
      if (slug) {
        const data = await getTourBySlug(slug);
        if (data || !initialTour) setTour(data);
      }
      setLoading(false);
    }
    loadTour();
  }, [slug, initialTour]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-navyDark via-[#1a1a4e] to-[#2d1b4e] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primaryCyan border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold">Loading Package Details...</p>
        </div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen bg-lightBg py-20 px-4 text-center">
        <h2 className="text-2xl font-bold text-navyBlue mb-4">Tour Package Not Found</h2>
        <p className="text-slate-600 mb-6">The requested travel package could not be found or has been updated.</p>
        <Link href="/" className="bg-navyBlue text-white px-6 py-3 rounded-xl font-bold text-sm">
          Return to Home Page
        </Link>
      </div>
    );
  }

  const handleInlineInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await submitInquiry({
      name,
      email: '',
      phone,
      tourId: tour.id,
      tourTitle: tour.title,
      travelDate,
      guestsCount: 2,
    });
    toast.result(res);
    setSubmitting(false);
    if (res.success) {
      markInquirySubmitted();
      setName('');
      setPhone('');
      setTravelDate('');
    }
  };

  return (
    <>
      {/* Banner */}
      <div className="relative bg-gradient-to-b from-navyDark via-[#1a1a4e] to-[#2d1b4e] text-white pt-8 sm:pt-12 pb-16 sm:pb-20">
        <img
          src={tour.imageUrl}
          alt={tour.title}
          className="absolute inset-0 w-full h-full object-cover object-center opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navyDark via-navyDark/80 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-primaryCyan hover:underline mb-3 sm:mb-4 font-semibold">
            <ArrowLeft className="w-4 h-4" /> Back to Packages
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 sm:gap-6">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-primaryCyan/20 text-primaryCyan text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full uppercase border border-primaryCyan/40">
                  {tour.category}
                </span>
                <span className="flex items-center gap-1 text-[10px] sm:text-xs text-slate-300 font-semibold">
                  <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primaryCyan" /> {tour.location}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black text-white leading-tight mb-3 sm:mb-4">
                {tour.title}
              </h1>

              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-800">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primaryCyan" /> {tour.durationNights}N / {tour.durationDays}D
                </span>
                <span className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-800">
                  <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 text-amber-400" /> {tour.rating} ({tour.reviewCount})
                </span>
              </div>
            </div>

            {/* Starting Price Box */}
            <div className="bg-navyBlue/90 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-slate-700 shadow-2xl flex flex-col items-end w-full lg:w-auto">
              {tour.showPrice === false ? (
                <>
                  <span className="text-[10px] sm:text-xs text-slate-400 font-semibold">Price</span>
                  <span className="text-xl sm:text-2xl font-black text-white my-1">On request</span>
                </>
              ) : (
                <>
                  <span className="text-[10px] sm:text-xs text-slate-400 font-semibold">Starting Price Per Person</span>
                  <div className="flex items-baseline gap-2 my-1">
                    <span className="text-2xl sm:text-3xl font-black text-white">₹{tour.price.toLocaleString('en-IN')}</span>
                    {tour.originalPrice && (
                      <span className="text-xs sm:text-sm text-slate-400 line-through">₹{tour.originalPrice.toLocaleString('en-IN')}</span>
                    )}
                  </div>
                </>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setInquiryModalOpen(true);
                }}
                className="w-full mt-2 bg-gradient-to-r from-primaryCyan to-blue-600 hover:brightness-110 text-navyDark font-extrabold px-6 py-2.5 rounded-xl text-sm shadow-glow transition-all touch-manipulation"
              >
                BOOK THIS TOUR
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="relative bg-gradient-to-br from-navyDark via-navyBlue to-primaryCyan/20 min-h-screen text-white">
        {/* Decorative Glow */}
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-primaryCyan/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Left Column: Details, Highlights, Itinerary */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8 min-w-0">
              {/* Description */}
              {tour.description && (
                <div className="bg-navyDark/60 backdrop-blur-md p-4 sm:p-6 rounded-2xl border border-slate-700/50 shadow-sm">
                  <h2 className="text-lg sm:text-xl font-bold text-white mb-3">About this Package</h2>
                  <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed [overflow-wrap:anywhere]">
                    {tour.description
                      .split('\n')
                      .filter((p) => p.trim())
                      .map((p, i) => (
                        <p key={i}>{p}</p>
                      ))}
                  </div>
                </div>
              )}

              {/* Tour Includes (facilities) */}
              {tour.facilities && tour.facilities.length > 0 && (
                <div className="bg-navyDark/60 backdrop-blur-md p-4 sm:p-6 rounded-2xl border border-slate-700/50 shadow-sm">
                  <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Tour Includes</h2>
                  <ul className="flex flex-wrap gap-4 sm:gap-6">
                    {TOUR_FACILITIES.filter((f) => tour.facilities!.includes(f.key)).map((f) => {
                      const Icon = FACILITY_ICONS[f.key];
                      return (
                        <li key={f.key} className="flex flex-col items-center gap-2 w-20 text-center">
                          <span className="w-12 h-12 rounded-full bg-primaryCyan/15 text-primaryCyan flex items-center justify-center">
                            <Icon className="w-5 h-5" />
                          </span>
                          <span className="text-[11px] sm:text-xs font-semibold text-slate-200">{f.label}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Highlights */}
              <div className="bg-navyDark/60 backdrop-blur-md p-4 sm:p-6 rounded-2xl border border-slate-700/50 shadow-sm">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Tour Highlights</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                  {tour.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-300 min-w-0 [overflow-wrap:anywhere]">
                      <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 flex-shrink-0 mt-0.5 sm:mt-1" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Inclusions (generic row for tours without facilities, plus any listed inclusions) */}
              {(!tour.facilities?.length || (tour.inclusions && tour.inclusions.length > 0)) && (
              <div className="bg-navyDark/60 backdrop-blur-md p-4 sm:p-6 rounded-2xl border border-slate-700/50 shadow-sm">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">What's Included</h3>
                {!tour.facilities?.length && (
                <div className="flex flex-wrap items-center gap-3 sm:gap-6 mb-3 sm:mb-4 text-[10px] sm:text-xs font-bold text-slate-300 pb-3 sm:pb-4 border-b border-slate-700/50">
                  <span className="flex items-center gap-1.5"><Hotel className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primaryCyan" /> Accommodation</span>
                  <span className="flex items-center gap-1.5"><Utensils className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primaryCyan" /> Daily Breakfast & Dinner</span>
                  <span className="flex items-center gap-1.5"><Car className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primaryCyan" /> Private AC Vehicle</span>
                  <span className="flex items-center gap-1.5"><Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primaryCyan" /> Guided Sightseeing</span>
                </div>
                )}
                {tour.inclusions && tour.inclusions.length > 0 && (
                  <ul className="space-y-1.5 sm:space-y-2">
                    {tour.inclusions.map((inc, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-400">
                        <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" /> {inc}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              )}

              {/* Day by Day Itinerary */}
              {tour.itinerary && tour.itinerary.length > 0 && (
                <div className="bg-navyDark/60 backdrop-blur-md p-4 sm:p-6 rounded-2xl border border-slate-700/50 shadow-sm">
                  <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-bold text-white">
                      Itinerary <span className="text-xs font-normal text-slate-400 italic">(Day Wise)</span>
                    </h2>
                    <button
                      type="button"
                      onClick={() => setOpenDays(openDays.length === tour.itinerary!.length ? [] : tour.itinerary!.map((d) => d.day))}
                      hidden={!tour.itinerary.some((d) => d.description || d.stay || d.places?.length || d.meals?.length)}
                      className="text-xs font-bold text-primaryCyan hover:underline"
                    >
                      {openDays.length === tour.itinerary.length ? 'Collapse all' : 'View all days'}
                    </button>
                  </div>
                  <ol className="relative border-l border-dashed border-slate-600 ml-2 space-y-3 sm:space-y-4">
                    {tour.itinerary.map((item) => {
                      const hasDetails = !!(item.description || item.stay || item.places?.length || item.meals?.length);
                      const open = hasDetails && openDays.includes(item.day);
                      return (
                        <li key={item.day} className="pl-5 relative">
                          <Navigation className="w-4 h-4 text-primaryCyan absolute -left-2 top-3 bg-navyDark rotate-45" aria-hidden="true" />
                          <div className="border border-slate-700/50 rounded-xl overflow-hidden">
                            <button
                              type="button"
                              onClick={() => hasDetails && toggleDay(item.day)}
                              aria-expanded={hasDetails ? open : undefined}
                              disabled={!hasDetails}
                              className="w-full bg-slate-900/60 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between text-left enabled:hover:bg-slate-800 disabled:cursor-default transition-colors touch-manipulation"
                            >
                              <span>
                                <span className="block font-bold text-xs sm:text-sm text-white">Day {item.day}</span>
                                {item.title && <span className="block text-[11px] sm:text-xs text-slate-400 mt-0.5 [overflow-wrap:anywhere]">{item.title}</span>}
                              </span>
                              {hasDetails && <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />}
                            </button>

                            {open && (
                              <div className="p-3 sm:p-4 bg-navyDark text-[11px] sm:text-xs text-slate-300 leading-relaxed border-t border-slate-700/50 space-y-3 [overflow-wrap:anywhere]">
                                {item.places && item.places.length > 0 && (
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-primaryCyan" />
                                    {item.places.map((place) => (
                                      <span key={place} className="bg-primaryCyan/10 text-primaryCyan border border-primaryCyan/30 rounded-full px-2.5 py-0.5 font-semibold">
                                        {place}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                {item.description && <p>{item.description}</p>}
                                {((item.meals && item.meals.length > 0) || item.stay) && (
                                  <div className="flex flex-wrap gap-x-5 gap-y-1.5 pt-1 text-slate-400">
                                    {item.meals && item.meals.length > 0 && (
                                      <span className="flex items-center gap-1.5">
                                        <Utensils className="w-3.5 h-3.5 text-primaryCyan" /> {item.meals.join(', ')}
                                      </span>
                                    )}
                                    {item.stay && (
                                      <span className="flex items-center gap-1.5">
                                        <BedDouble className="w-3.5 h-3.5 text-primaryCyan" /> {item.stay}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              )}
            </div>

          {/* Right Column: Sticky Quick Inquiry Box */}
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-navyBlue text-white p-4 sm:p-6 rounded-2xl border border-slate-700 shadow-xl sticky top-24">
              <h3 className="text-base sm:text-lg font-bold text-white mb-1">Get Instant Free Quote</h3>
              <p className="text-[11px] sm:text-xs text-slate-400 mb-3 sm:mb-4">Speak directly with our travel expert for customized dates and discounts.</p>

              {(
                <form onSubmit={handleInlineInquiry} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ankit Sharma"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primaryCyan"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primaryCyan"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Expected Travel Date</label>
                    <input
                      type="date"
                      value={travelDate}
                      onChange={(e) => setTravelDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primaryCyan"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-primaryCyan to-blue-600 hover:brightness-110 text-navyDark font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-glow transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>REQUEST CALL BACK</span>
                  </button>
                </form>
              )}

              <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-center gap-2 text-xs text-slate-300">
                <Phone className="w-4 h-4 text-primaryCyan" />
                <span>Or Call Us: </span>
                <a href="tel:+919811980218" className="font-bold text-white hover:text-primaryCyan">
                  +91 9811980218
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

      <InquiryModal
        tour={tour}
        isOpen={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
      />
    </>
  );
}
