'use client';

import React from 'react';
import Link from 'next/link';
import { Star, Clock, MapPin, Hotel, Utensils, Car, Compass, Check, ArrowUpRight } from 'lucide-react';
import { TourPackage } from '@/types';
import { mediaUrl } from '@/lib/routes';

interface TourPackageCardProps {
  tour: TourPackage;
  onEnquire?: (tour: TourPackage) => void;
}

const INCLUSIONS = [
  { icon: Hotel, label: 'Hotels' },
  { icon: Utensils, label: 'Meals' },
  { icon: Car, label: 'Transfer' },
  { icon: Compass, label: 'Sightseeing' },
];

// "kerala-tour-packages" / "andamantourpackage" -> "Kerala" / "Andaman"
function formatLocation(location: string) {
  return location
    .replace(/[-_]?tour[-_]?packages?$/i, '')
    .replace(/[-_]?packages?$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim() || location;
}

export default function TourPackageCard({ tour, onEnquire }: TourPackageCardProps) {
  const discountPercent = tour.showPrice !== false && tour.originalPrice
    ? Math.round(((tour.originalPrice - tour.price) / tour.originalPrice) * 100)
    : 0;

  return (
    <div className="group relative h-full flex flex-col rounded-3xl bg-white/[0.04] backdrop-blur-md border border-white/10 p-2.5 transition-all duration-300 hover:-translate-y-1 hover:border-primaryCyan/40 hover:shadow-glow">
      {/* Image */}
      <Link href={`/tour/${tour.slug}`} className="relative block h-56 sm:h-60 overflow-hidden rounded-2xl">
        <img
          src={mediaUrl(tour.imageUrl)}
          alt={tour.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navyDark via-navyDark/30 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          <span className="flex items-center gap-1 bg-navyDark/60 backdrop-blur-md border border-white/15 text-white text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-full">
            <Star className="w-3 h-3 fill-accentGold text-accentGold" />
            {tour.rating}
            {tour.reviewCount > 0 && <span className="text-white/60 font-medium">({tour.reviewCount})</span>}
          </span>
          {discountPercent > 0 && (
            <span className="bg-primaryCyan text-white text-[10px] sm:text-[11px] font-black px-2.5 py-1 rounded-full uppercase shadow-lg shadow-primaryCyan/30">
              Save {discountPercent}%
            </span>
          )}
        </div>

        {/* Title over image */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-3 text-[10px] sm:text-[11px] font-semibold text-white/80 mb-1.5">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-primaryCyan" />
              {formatLocation(tour.location)}
            </span>
            <span className="w-1 h-1 rounded-full bg-white/40" />
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-primaryCyan" />
              {tour.durationNights}N / {tour.durationDays}D
            </span>
          </div>
          <h3 className="font-extrabold text-white text-base sm:text-lg leading-snug line-clamp-2">
            {tour.title}
          </h3>
        </div>
      </Link>

      {/* Body */}
      <div className="flex-1 flex flex-col px-2 pt-4 pb-1">
        {/* Highlights */}
        <ul className="space-y-1.5 mb-4">
          {tour.highlights.slice(0, 2).map((h, i) => (
            <li key={i} className="flex items-start gap-2 text-[11px] sm:text-xs text-slate-300">
              <Check className="w-3.5 h-3.5 text-primaryCyan flex-shrink-0 mt-0.5" />
              <span className="line-clamp-1">{h}</span>
            </li>
          ))}
        </ul>

        {/* Inclusions */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {INCLUSIONS.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="flex items-center gap-1 text-[10px] font-semibold text-slate-300 bg-white/5 border border-white/10 px-2 py-1 rounded-full"
            >
              <Icon className="w-3 h-3 text-slate-400" />
              {label}
            </span>
          ))}
        </div>

        {/* Price + CTA */}
        <div className="mt-auto flex items-center justify-between gap-3 rounded-2xl bg-white/[0.06] border border-white/10 p-3">
          {tour.showPrice === false ? (
            <div className="flex flex-col">
              <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest">Price</span>
              <span className="text-sm sm:text-base font-black text-white leading-tight">On request</span>
            </div>
          ) : (
          <div className="flex flex-col">
            <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest">Per person</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-xl font-black text-white leading-tight">
                ₹{tour.price.toLocaleString('en-IN')}
              </span>
              {tour.originalPrice && (
                <span className="text-[10px] sm:text-[11px] text-slate-500 line-through font-semibold">
                  ₹{tour.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onEnquire) onEnquire(tour);
            }}
            className="flex items-center gap-1 bg-primaryCyan hover:bg-secondaryCyan text-white text-[11px] sm:text-xs font-bold px-4 py-2.5 rounded-xl transition-colors touch-manipulation"
          >
            Enquire
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
