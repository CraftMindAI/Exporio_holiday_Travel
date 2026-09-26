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
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-card hover:shadow-cardHover transition-all duration-300 flex flex-col group">
      {/* Image Header */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={tour.imageUrl}
          alt={tour.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Duration Badge */}
        <div className="absolute top-3 left-3 bg-navyBlue/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow">
          <Clock className="w-3.5 h-3.5 text-primaryCyan" />
          <span>{tour.durationNights} Nights / {tour.durationDays} Days</span>
        </div>

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded-full uppercase shadow">
            {discountPercent}% OFF
          </div>
        )}

        {/* Rating Pill */}
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md text-slate-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{tour.rating}</span>
          <span className="text-slate-500 font-normal">({tour.reviewCount})</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Location */}
          <div className="flex items-center gap-1 text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>{tour.location}</span>
          </div>

          {/* Title */}
          <h3 className="font-extrabold text-navyBlue text-lg leading-snug mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
            <Link href={`/tour/${tour.slug}`}>{tour.title}</Link>
          </h3>

          {/* Highlights */}
          <ul className="space-y-1.5 mb-4">
            {tour.highlights.slice(0, 2).map((h, i) => (
              <li key={i} className="text-xs text-steelGray flex items-start gap-1.5 line-clamp-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>{h}</span>
              </li>
            ))}
          </ul>

          {/* Inclusions Icons */}
          <div className="flex items-center gap-3 py-2 border-t border-b border-slate-100 text-slate-500 text-[11px] mb-4">
            <span className="flex items-center gap-1" title="Hotel Stay Included">
              <Hotel className="w-3.5 h-3.5 text-navyBlue" /> Hotels
            </span>
            <span className="flex items-center gap-1" title="Daily Meals Included">
              <Utensils className="w-3.5 h-3.5 text-navyBlue" /> Meals
            </span>
            <span className="flex items-center gap-1" title="Transfers Included">
              <Car className="w-3.5 h-3.5 text-navyBlue" /> Transfers
            </span>
            <span className="flex items-center gap-1" title="Sightseeing Included">
              <Compass className="w-3.5 h-3.5 text-navyBlue" /> Tours
            </span>
          </div>
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <span className="text-[11px] text-slate-400 font-semibold block leading-tight">Starting From</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-navyBlue">₹{tour.price.toLocaleString('en-IN')}</span>
              {tour.originalPrice && (
                <span className="text-xs text-slate-400 line-through">
                  ₹{tour.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/tour/${tour.slug}`}
              className="p-2 rounded-xl bg-slate-100 text-navyBlue hover:bg-slate-200 transition-colors"
              title="View Package Details"
            >
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => onEnquire && onEnquire(tour)}
              className="bg-navyBlue hover:bg-navyDark text-white text-xs font-extrabold px-4 py-2.5 rounded-xl shadow transition-all hover:brightness-110"
            >
              ENQUIRE NOW
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
