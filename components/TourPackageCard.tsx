'use client';

import React from 'react';
import Link from 'next/link';
import { Star, Clock, MapPin, Hotel, Utensils, Car, Compass, CheckCircle2, ArrowRight } from 'lucide-react';
import { TourPackage } from '@/types';

interface TourPackageCardProps {
  tour: TourPackage;
  onEnquire?: (tour: TourPackage) => void;
}

export default function TourPackageCard({ tour, onEnquire }: TourPackageCardProps) {
  const discountPercent = tour.originalPrice
    ? Math.round(((tour.originalPrice - tour.price) / tour.originalPrice) * 100)
    : 0;

  return (
    <div className="bg-[#F4F8FB] rounded-2xl overflow-hidden border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.05)] hover:shadow-[0_10px_40px_rgb(0,0,0,0.1)] transition-all duration-300 flex flex-col group relative">
      {/* Image Header */}
      <div className="relative h-52 sm:h-56 overflow-hidden">
        <Link href={`/tour/${tour.slug}`} className="block w-full h-full">
          <img
            src={tour.imageUrl}
            alt={tour.title}
            className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navyDark/90 via-navyDark/20 to-transparent" />
        </Link>
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          <div className="bg-white/95 backdrop-blur-md text-navyDark text-[10px] sm:text-xs font-black px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg">
            <Clock className="w-3.5 h-3.5 text-[#ff6b2b]" />
            <span>{tour.durationNights}N / {tour.durationDays}D</span>
          </div>
          {discountPercent > 0 && (
            <div className="bg-gradient-to-r from-red-600 to-red-500 text-white text-[10px] sm:text-xs font-black px-2.5 py-1.5 rounded-lg uppercase shadow-lg shadow-red-500/30">
              {discountPercent}% OFF
            </div>
          )}
        </div>

        {/* Location & Rating at bottom of image */}
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end pointer-events-none">
          <div className="flex items-center gap-1 text-white bg-navyDark/40 backdrop-blur-sm px-2 py-1 rounded-md border border-white/10">
            <MapPin className="w-3.5 h-3.5 text-primaryCyan" />
            <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase">{tour.location}</span>
          </div>
          <div className="bg-amber-400 text-navyDark text-[10px] sm:text-xs font-black px-2 py-1 rounded-md flex items-center gap-1 shadow-lg">
            <Star className="w-3.5 h-3.5 fill-navyDark" />
            <span>{tour.rating}</span>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-transparent relative">
        <div className="mb-4">
          {/* Title */}
          <h3 className="font-extrabold text-navyDark text-[17px] sm:text-lg leading-snug mb-3 group-hover:text-[#ff6b2b] transition-colors line-clamp-2">
            <Link href={`/tour/${tour.slug}`}>{tour.title}</Link>
          </h3>

          {/* Highlights */}
          <ul className="space-y-1.5 mb-4">
            {tour.highlights.slice(0, 2).map((h, i) => (
              <li key={i} className="text-[11px] sm:text-xs text-slate-600 flex items-start gap-2 line-clamp-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>{h}</span>
              </li>
            ))}
          </ul>

          {/* Inclusions - Grid Layout */}
          <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-100">
            <div className="flex flex-col items-center justify-center gap-1 p-1.5 rounded-lg bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors" title="Hotel Stay Included">
              <Hotel className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider">Hotels</span>
            </div>
            <div className="flex flex-col items-center justify-center gap-1 p-1.5 rounded-lg bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors" title="Meals Included">
              <Utensils className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider">Meals</span>
            </div>
            <div className="flex flex-col items-center justify-center gap-1 p-1.5 rounded-lg bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors" title="Transfers Included">
              <Car className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider">Transfer</span>
            </div>
            <div className="flex flex-col items-center justify-center gap-1 p-1.5 rounded-lg bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors" title="Sightseeing Included">
              <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider">Tours</span>
            </div>
          </div>
        </div>

        {/* Footer Area */}
        <div className="mt-auto pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Starting From</span>
              <div className="flex items-end gap-2">
                <span className="text-xl sm:text-2xl font-black text-navyDark leading-none">₹{tour.price.toLocaleString('en-IN')}</span>
                {tour.originalPrice && (
                  <span className="text-[10px] sm:text-[11px] text-slate-400 line-through font-semibold mb-0.5">
                    ₹{tour.originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onEnquire) onEnquire(tour);
              }}
              className="bg-gradient-to-r from-[#ff6b2b] to-[#ff2a00] hover:from-[#ff2a00] hover:to-[#ff6b2b] text-white text-[11px] sm:text-xs font-black px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-1.5 touch-manipulation"
            >
              ENQUIRE
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
