'use client';

import React from 'react';
import { Star, Quote, Award, ShieldCheck, HeartHandshake, Headphones } from 'lucide-react';
import { Review } from '@/types';

const TESTIMONIALS: Review[] = [
  {
    id: 'r1',
    author: 'Rajesh Sharma',
    location: 'Mumbai, Maharashtra',
    rating: 5,
    comment: 'Our Sikkim trip organized by Etripto was flawless! The hotel views of Kanchenjunga in Pelling and the driver were top notch. Highly recommended travel agency!',
    tourName: 'Sikkim & Gangtok Package',
    date: 'February 2026'
  },
  {
    id: 'r2',
    author: 'Priya & Ankit Roy',
    location: 'Kolkata, West Bengal',
    rating: 5,
    comment: 'Booked our honeymoon in Kashmir through Etripto. The houseboat stay in Srinagar and Gulmarg cable car booking were arranged without any hassle.',
    tourName: 'Kashmir Paradise Package',
    date: 'January 2026'
  },
  {
    id: 'r3',
    author: 'Sunil Nair',
    location: 'Bengaluru, Karnataka',
    rating: 5,
    comment: 'Etripto provided transparent pricing and 24/7 customer assistance during our family trip to Bhutan. Everything from SDF permits to hotels was super smooth.',
    tourName: 'Bhutan Himalayan Journey',
    date: 'December 2025'
  }
];

export default function Testimonials() {
  return (
    <section className="py-16 bg-gradient-to-b from-navyDark via-[#1a1a4e] to-[#2d1b4e] text-white relative overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primaryCyan/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Why Choose Us Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 border-b border-slate-800 pb-12">
          <div className="flex items-center gap-3 p-4 bg-navyBlue/60 rounded-xl border border-slate-800">
            <ShieldCheck className="w-8 h-8 text-primaryCyan flex-shrink-0" />
            <div>
              <h4 className="font-bold text-sm text-white">100% Verified Hotels</h4>
              <p className="text-[11px] text-slate-400">Handpicked luxury & budget stays</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-navyBlue/60 rounded-xl border border-slate-800">
            <Award className="w-8 h-8 text-accentGold flex-shrink-0" />
            <div>
              <h4 className="font-bold text-sm text-white">Best Price Guarantee</h4>
              <p className="text-[11px] text-slate-400">Transparent & direct rates</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-navyBlue/60 rounded-xl border border-slate-800">
            <HeartHandshake className="w-8 h-8 text-emerald-400 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-sm text-white">Customized Packages</h4>
              <p className="text-[11px] text-slate-400">Tailored to your itinerary</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-navyBlue/60 rounded-xl border border-slate-800">
            <Headphones className="w-8 h-8 text-blue-400 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-sm text-white">24/7 On-Trip Support</h4>
              <p className="text-[11px] text-slate-400">Dedicated tour coordinator</p>
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1 text-amber-400 text-sm font-bold bg-amber-400/10 px-3 py-1 rounded-full mb-3 border border-amber-400/20">
            <Star className="w-4 h-4 fill-amber-400" />
            <span>4.9 / 5.0 Rating from 4,500+ Reviews</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-3">
            What Our Travelers Say
          </h2>
          <p className="text-slate-300 text-sm md:text-base">
            Read real feedback from guests who created unforgettable memories with Etripto.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((item) => (
            <div
              key={item.id}
              className="bg-navyBlue/80 border border-slate-800 p-6 rounded-2xl relative shadow-xl flex flex-col justify-between"
            >
              <Quote className="w-8 h-8 text-primaryCyan/20 absolute top-4 right-4" />

              <div>
                {/* Stars */}
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-200 text-sm leading-relaxed mb-6 italic">
                  "{item.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white">{item.author}</h4>
                  <span className="text-[11px] text-primaryCyan">{item.location}</span>
                </div>
                <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-1 rounded">
                  {item.tourName}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
