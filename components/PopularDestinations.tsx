'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';
import { POPULAR_DESTINATIONS } from '@/data/toursData';

export default function PopularDestinations() {
  return (
    <section className="py-16 bg-lightBg">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-extrabold tracking-widest text-blue-600 uppercase bg-blue-100 px-3 py-1 rounded-full inline-block mb-3">
            Top Tourist Locations
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-navyBlue tracking-tight mb-3">
            Popular Tour Destinations
          </h2>
          <p className="text-steelGray text-sm md:text-base">
            Handpicked vacation spots across India and international destinations tailored for couples, families, and group getaways.
          </p>
        </div>

        {/* Destination Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {POPULAR_DESTINATIONS.map((dest) => (
            <Link
              key={dest.id}
              href={`/location/${dest.slug}`}
              className="group relative h-64 md:h-72 rounded-2xl overflow-hidden shadow-card hover:shadow-cardHover transition-all duration-300 transform hover:-translate-y-1 block"
            >
              {/* Background Image */}
              <img
                src={dest.imageUrl}
                alt={dest.name}
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
              />
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-navyDark via-navyDark/40 to-transparent" />

              {/* Tag */}
              <div className="absolute top-3 left-3 bg-navyBlue/80 backdrop-blur-md text-primaryCyan text-[11px] font-bold px-2.5 py-1 rounded-full uppercase border border-slate-700">
                {dest.category}
              </div>

              {/* Card Content */}
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <div className="flex items-center gap-1.5 text-xs text-primaryCyan mb-1 font-semibold">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{dest.packageCount}+ Tour Packages</span>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-primaryCyan transition-colors flex items-center justify-between">
                  <span>{dest.name}</span>
                  <ArrowRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
