'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getTourBySlug } from '@/lib/supabase';
import { TourPackage } from '@/types';
import InquiryModal from '@/components/InquiryModal';
import { Star, Clock, MapPin, CheckCircle2, XCircle, Hotel, Utensils, Car, Compass, Calendar, ChevronDown, Phone, Send, ArrowLeft } from 'lucide-react';
import { submitInquiry } from '@/lib/supabase';

export default function TourDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [tour, setTour] = useState<TourPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [activeDay, setActiveDay] = useState<number | null>(1);

  // Quick Inline Lead Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formMsg, setFormMsg] = useState('');

  useEffect(() => {
    async function loadTour() {
      if (slug) {
        const data = await getTourBySlug(slug);
        setTour(data);
      }
      setLoading(false);
    }
    loadTour();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-navyDark text-white flex items-center justify-center">
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
    setFormMsg(res.message);
    setSubmitting(false);
    setName('');
    setPhone('');
  };

  return (
    <>
      {/* Banner */}
      <div className="relative bg-navyDark text-white pt-12 pb-20">
        <img
          src={tour.imageUrl}
          alt={tour.title}
          className="absolute inset-0 w-full h-full object-cover object-center opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navyDark via-navyDark/80 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-primaryCyan hover:underline mb-4 font-semibold">
            <ArrowLeft className="w-4 h-4" /> Back to Packages
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-primaryCyan/20 text-primaryCyan text-xs font-bold px-3 py-1 rounded-full uppercase border border-primaryCyan/40">
                  {tour.category}
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-300 font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-primaryCyan" /> {tour.location}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-4">
                {tour.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                  <Clock className="w-4 h-4 text-primaryCyan" /> {tour.durationNights} Nights / {tour.durationDays} Days
                </span>
                <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> {tour.rating} ({tour.reviewCount} Reviews)
                </span>
              </div>
            </div>

            {/* Starting Price Box */}
            <div className="bg-navyBlue/90 backdrop-blur-md p-5 rounded-2xl border border-slate-700 shadow-2xl flex flex-col items-end">
              <span className="text-xs text-slate-400 font-semibold">Starting Price Per Person</span>
              <div className="flex items-baseline gap-2 my-1">
                <span className="text-3xl font-black text-white">₹{tour.price.toLocaleString('en-IN')}</span>
                {tour.originalPrice && (
                  <span className="text-sm text-slate-400 line-through">₹{tour.originalPrice.toLocaleString('en-IN')}</span>
                )}
              </div>
              <button
                onClick={() => setInquiryModalOpen(true)}
                className="w-full mt-2 bg-gradient-to-r from-primaryCyan to-blue-600 hover:brightness-110 text-navyDark font-extrabold px-6 py-2.5 rounded-xl text-sm shadow-glow transition-all"
              >
                BOOK THIS TOUR
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Details, Highlights, Itinerary */}
          <div className="lg:col-span-2 space-y-8">
            {/* Highlights */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-navyBlue mb-4">Tour Highlights</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tour.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-1" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Inclusions */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-navyBlue mb-4">What's Included</h3>
              <div className="flex flex-wrap items-center gap-6 mb-4 text-xs font-bold text-slate-700 pb-4 border-b border-slate-100">
                <span className="flex items-center gap-1.5"><Hotel className="w-4 h-4 text-blue-600" /> Accommodation</span>
                <span className="flex items-center gap-1.5"><Utensils className="w-4 h-4 text-blue-600" /> Daily Breakfast & Dinner</span>
                <span className="flex items-center gap-1.5"><Car className="w-4 h-4 text-blue-600" /> Private AC Vehicle</span>
                <span className="flex items-center gap-1.5"><Compass className="w-4 h-4 text-blue-600" /> Guided Sightseeing</span>
              </div>
              {tour.inclusions && (
                <ul className="space-y-2">
                  {tour.inclusions.map((inc, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {inc}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Day by Day Itinerary */}
            {tour.itinerary && tour.itinerary.length > 0 && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold text-navyBlue mb-6">Day Wise Itinerary</h3>
                <div className="space-y-4">
                  {tour.itinerary.map((item) => (
                    <div key={item.day} className="border border-slate-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setActiveDay(activeDay === item.day ? null : item.day)}
                        className="w-full bg-slate-50 px-4 py-3 flex items-center justify-between text-left hover:bg-slate-100 transition-colors"
                      >
                        <span className="font-bold text-sm text-navyBlue">
                          Day {item.day}: {item.title}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${activeDay === item.day ? 'rotate-180' : ''}`} />
                      </button>

                      {activeDay === item.day && (
                        <div className="p-4 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                          {item.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Quick Inquiry Box */}
          <div className="space-y-6">
            <div className="bg-navyBlue text-white p-6 rounded-2xl border border-slate-700 shadow-xl sticky top-24">
              <h3 className="text-lg font-bold text-white mb-1">Get Instant Free Quote</h3>
              <p className="text-xs text-slate-400 mb-4">Speak directly with our travel expert for customized dates and discounts.</p>

              {formMsg ? (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500 text-emerald-300 text-xs rounded-xl mb-4">
                  {formMsg}
                </div>
              ) : (
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

      <InquiryModal
        tour={tour}
        isOpen={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
      />
    </>
  );
}
