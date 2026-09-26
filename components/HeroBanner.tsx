'use client';

import React, { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, DollarSign, Award, Users, ChevronRight, ChevronLeft, Plane } from 'lucide-react';

const HERO_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1920&q=80',
    title: 'Explore Majestic Sikkim & Gangtok',
    subtitle: 'Exporio Holidays - High Altitude Lakes, Snow Passports & Sacred Monasteries',
  },
  {
    image: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=1920&q=80',
    title: 'Experience Kashmir Paradise On Earth',
    subtitle: 'Luxury Houseboats on Dal Lake & Gondola Cable Cars in Gulmarg',
  },
  {
    image: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=1920&q=80',
    title: 'Discover Crystal Andaman Islands',
    subtitle: 'Scuba Diving, Radhanagar Beach & Exotic Coral Reefs',
  }
];

export default function HeroBanner({ onSearch }: { onSearch?: (destination: string) => void }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState('all');
  const [budget, setBudget] = useState('all');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(destination);
    }
  };

  return (
    <section className="relative min-h-[550px] lg:min-h-[620px] flex flex-col justify-between overflow-hidden bg-navyDark text-white">
      {/* Background Image Carousel Slider */}
      {HERO_SLIDES.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover object-center scale-105 transform transition-transform duration-10000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navyDark via-navyDark/60 to-navyDark/40" />
        </div>
      ))}

      {/* Hero Slide Controls */}
      <button
        onClick={() => setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-primaryCyan hover:text-navyDark text-white flex items-center justify-center transition-all"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-primaryCyan hover:text-navyDark text-white flex items-center justify-center transition-all"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Hero Main Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 pt-16 pb-8 w-full flex-1 flex flex-col justify-center items-center text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primaryCyan/20 border border-primaryCyan/40 text-primaryCyan text-xs md:text-sm font-semibold mb-4 backdrop-blur-md">
          <Plane className="w-4 h-4 text-primaryCyan transform -rotate-45" />
          <span className="font-extrabold uppercase tracking-widest">EXPORIO HOLIDAYS - TRAVEL BEYOND BORDERS</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-4 max-w-4xl leading-tight">
          Exporio Holidays <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-primaryCyan">
            Travel Beyond Borders
          </span>
        </h1>

        <p className="text-slate-200 text-sm md:text-lg max-w-2xl mb-8 font-medium">
          {HERO_SLIDES[currentSlide].subtitle}
        </p>

        {/* Slide Indicators */}
        <div className="flex items-center gap-2 mb-8">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentSlide ? 'w-8 bg-primaryCyan' : 'w-2 bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Search Filter Container floating at bottom */}
      <div className="relative z-20 max-w-5xl mx-auto px-4 pb-8 w-full">
        <form
          onSubmit={handleSearchSubmit}
          className="bg-navyBlue/90 backdrop-blur-md border border-slate-700/80 p-4 md:p-5 rounded-2xl shadow-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center"
        >
          {/* Destination */}
          <div className="relative">
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-primaryCyan" /> Destination
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Sikkim, Kashmir, Bali"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primaryCyan"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-primaryCyan" /> Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primaryCyan"
            >
              <option value="all">Any Duration</option>
              <option value="3-5">3 - 5 Days</option>
              <option value="6-8">6 - 8 Days</option>
              <option value="9+">9+ Days</option>
            </select>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-primaryCyan" /> Budget / Person
            </label>
            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primaryCyan"
            >
              <option value="all">Any Budget</option>
              <option value="under15k">Under ₹15,000</option>
              <option value="15k-25k">₹15,000 - ₹25,000</option>
              <option value="25k+">₹25,000+</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="sm:col-span-2 lg:col-span-1 pt-1">
            <button
              type="submit"
              className="w-full h-[42px] bg-gradient-to-r from-primaryCyan to-blue-600 hover:brightness-110 text-navyDark font-extrabold rounded-xl text-sm flex items-center justify-center gap-2 shadow-glow transition-all"
            >
              <Search className="w-4 h-4" />
              <span>SEARCH TOURS</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
