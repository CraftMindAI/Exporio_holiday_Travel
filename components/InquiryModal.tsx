'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, ShieldCheck } from 'lucide-react';
import { TourPackage, Inquiry } from '@/types';
import { submitInquiry } from '@/lib/supabase';

interface InquiryModalProps {
  tour?: TourPackage | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function InquiryModal({ tour, isOpen, onClose }: InquiryModalProps) {
  const [formData, setFormData] = useState<Inquiry>({
    name: '',
    email: '',
    phone: '',
    travelDate: '',
    guestsCount: 2,
    message: '',
  });

  const [nights, setNights] = useState('');
  const [destination, setDestination] = useState(tour?.title || '');
  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (tour?.title) {
      setDestination(tour.title);
    }
  }, [tour]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaChecked) {
      alert('Please confirm you are not a robot by clicking the reCAPTCHA box.');
      return;
    }
    setLoading(true);

    const payload: Inquiry = {
      ...formData,
      tourId: tour?.id,
      tourTitle: destination || 'General Travel Consultation',
      message: nights ? `${nights} nights. ${formData.message}` : formData.message
    };

    try {
      await submitInquiry(payload);
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setCaptchaChecked(false);
      }, 3000);
    } catch (err: any) {
      alert('Failed to submit inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="bg-navyDark/95 backdrop-blur-md text-slate-200 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 border border-slate-700/50">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-all shadow-md"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Banner Image */}
        <div className="relative h-28 sm:h-40 overflow-hidden bg-navyDark flex-shrink-0">
          <img
            src={tour?.imageUrl || "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80"}
            alt="Travelers Banner"
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Form Content - Scrollable */}
        <div className="overflow-y-auto custom-scrollbar p-6 sm:p-8">
          {submitted ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-extrabold text-white">Details Sent Successfully!</h4>
              <p className="text-xs text-slate-400">
                Our travel representative will contact you within 10 minutes with custom quotes & itineraries.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Row 1: Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Name"
                  className="w-full bg-slate-800/80 border border-slate-600 rounded-lg px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primaryCyan"
                />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Email Id"
                  className="w-full bg-slate-800/80 border border-slate-600 rounded-lg px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primaryCyan"
                />
              </div>

              {/* Row 2: Contact Number & No. of People */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Contact Number"
                  className="w-full bg-slate-800/80 border border-slate-600 rounded-lg px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primaryCyan"
                />
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.guestsCount || ''}
                  onChange={(e) => setFormData({ ...formData, guestsCount: parseInt(e.target.value) || 1 })}
                  placeholder="No. of People"
                  className="w-full bg-slate-800/80 border border-slate-600 rounded-lg px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primaryCyan"
                />
              </div>

              {/* Row 3: Select no. of nights & Date of Arrival */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select
                  required
                  value={nights}
                  onChange={(e) => setNights(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-600 rounded-lg px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-primaryCyan"
                >
                  <option value="">Select no. of nights</option>
                  <option value="2 Nights / 3 Days">2 Nights / 3 Days</option>
                  <option value="3 Nights / 4 Days">3 Nights / 4 Days</option>
                  <option value="4 Nights / 5 Days">4 Nights / 5 Days</option>
                  <option value="5 Nights / 6 Days">5 Nights / 6 Days</option>
                  <option value="6+ Nights">6+ Nights</option>
                </select>

                <div className="relative">
                  <input
                    type="date"
                    required
                    value={formData.travelDate}
                    onChange={(e) => setFormData({ ...formData, travelDate: e.target.value })}
                    className="w-full bg-slate-800/80 border border-slate-600 rounded-lg px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-primaryCyan"
                  />
                  {!formData.travelDate && (
                    <span className="absolute left-4 top-3 text-sm text-slate-500 pointer-events-none bg-slate-800 px-1">
                      Date of Arrival
                    </span>
                  )}
                </div>
              </div>

              {/* Row 4: Select Your Destination */}
              <div>
                <select
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-600 rounded-lg px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-primaryCyan"
                >
                  <option value="">Select Your Destination</option>
                  {tour && <option value={tour.title}>{tour.title}</option>}
                  <option value="Sikkim & Gangtok">Sikkim & Gangtok</option>
                  <option value="Kashmir">Kashmir</option>
                  <option value="Darjeeling">Darjeeling</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Andaman Islands">Andaman Islands</option>
                  <option value="Bhutan">Bhutan</option>
                  <option value="Bali">Bali</option>
                  <option value="Shimla & Manali">Shimla & Manali</option>
                  <option value="Leh Ladakh">Leh Ladakh</option>
                  <option value="Goa">Goa</option>
                  <option value="Uttarakhand">Uttarakhand</option>
                </select>
              </div>

              {/* Row 5: reCAPTCHA Widget Simulation */}
              <div className="w-[280px] p-2 bg-slate-800/80 border border-slate-600 rounded flex items-center justify-between my-4 shadow-sm">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={captchaChecked}
                    onChange={(e) => setCaptchaChecked(e.target.checked)}
                    className="w-5 h-5 rounded-sm text-primaryCyan border-slate-400 focus:ring-primaryCyan cursor-pointer"
                  />
                  <span className="text-xs font-medium text-slate-300">I'm not a robot</span>
                </label>

                <div className="flex flex-col items-center">
                  <ShieldCheck className="w-5 h-5 text-primaryCyan" />
                  <span className="text-[9px] text-slate-400 font-semibold uppercase">reCAPTCHA</span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="text-center pt-2 pb-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primaryCyan hover:brightness-110 text-white px-10 py-3 rounded-lg text-sm font-semibold transition-colors inline-flex items-center justify-center shadow-lg w-full sm:w-auto min-w-[200px]"
                >
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
