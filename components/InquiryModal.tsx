'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, ShieldCheck } from 'lucide-react';
import { TourPackage, Inquiry } from '@/types';
import { submitInquiry } from '@/lib/api';
import { toast } from '@/lib/toast';
import { markInquirySubmitted } from '@/lib/inquiryStatus';
import MultiSelect from './MultiSelect';

const NIGHT_OPTIONS = ['2 Nights / 3 Days', '3 Nights / 4 Days', '4 Nights / 5 Days', '5 Nights / 6 Days', '6+ Nights'];

const DESTINATION_OPTIONS = [
  'Sikkim & Gangtok',
  'Kashmir',
  'Darjeeling',
  'Kerala',
  'Andaman Islands',
  'Bhutan',
  'Bali',
  'Shimla & Manali',
  'Leh Ladakh',
  'Goa',
  'Uttarakhand',
];

interface InquiryModalProps {
  tour?: TourPackage | null;
  isOpen: boolean;
  onClose: () => void;
  /** Optional label prefixed to the message so admins know where the enquiry came from, e.g. "Stranger Trip" */
  context?: string;
}

export default function InquiryModal({ tour, isOpen, onClose, context }: InquiryModalProps) {
  const [formData, setFormData] = useState<Inquiry>({
    name: '',
    email: '',
    phone: '',
    travelDate: '',
    guestsCount: 2,
    message: '',
  });

  const [nights, setNights] = useState<string[]>([]);
  const [destinations, setDestinations] = useState<string[]>(tour?.title ? [tour.title] : []);
  const [showErrors, setShowErrors] = useState(false);
  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tour?.title) {
      setDestinations((prev) => (prev.includes(tour.title) ? prev : [tour.title, ...prev]));
    }
  }, [tour]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nights.length === 0 || destinations.length === 0) {
      setShowErrors(true);
      return;
    }
    if (!captchaChecked) {
      toast.error("Please confirm you are not a robot by ticking the \"I'm not a robot\" box.");
      return;
    }
    setLoading(true);

    const payload: Inquiry = {
      ...formData,
      tourId: tour?.id,
      tourTitle: destinations.join(', ') || 'General Travel Consultation',
      message: `${context ? `[${context}] ` : ''}${nights.length ? `Duration: ${nights.join(', ')}. ${formData.message}` : formData.message}`,
    };

    try {
      const res = await submitInquiry(payload);
      if (!res.success) {
        toast.error(res.message || 'Failed to submit inquiry. Please try again.');
        return;
      }
      markInquirySubmitted();
      toast.success('Details sent successfully! Our travel expert will contact you shortly with quotes and itineraries.');
      setFormData({ name: '', email: '', phone: '', travelDate: '', guestsCount: 2, message: '' });
      setNights([]);
      setCaptchaChecked(false);
      setShowErrors(false);
      onClose();
    } catch (err: any) {
      toast.error('Failed to submit inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-inquiry-modal className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="bg-navyDark/95 backdrop-blur-md text-slate-200 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 border border-slate-700/50">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-all shadow-md"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Banner Image */}
        <div className="relative h-20 sm:h-28 md:h-36 overflow-hidden bg-navyDark flex-shrink-0">
          <img
            src={tour?.imageUrl || "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80"}
            alt="Travelers Banner"
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Form Content - Scrollable */}
        <div className="overflow-y-auto custom-scrollbar p-4 sm:p-6">
          {(
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              {/* Row 1: Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Name"
                  className="w-full bg-slate-800/80 border border-slate-600 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primaryCyan"
                />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Email Id"
                  className="w-full bg-slate-800/80 border border-slate-600 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primaryCyan"
                />
              </div>

              {/* Row 2: Contact Number & No. of People */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Contact Number"
                  className="w-full bg-slate-800/80 border border-slate-600 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primaryCyan"
                />
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.guestsCount || ''}
                    onChange={(e) => setFormData({ ...formData, guestsCount: parseInt(e.target.value) || 1 })}
                    placeholder="No. of People"
                    className="w-full bg-slate-800/80 border border-slate-600 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primaryCyan"
                  />
                  {!formData.guestsCount && (
                    <span className="absolute left-3 sm:left-4 top-2.5 sm:top-3 text-sm text-slate-500 pointer-events-none">
                      No. of People
                    </span>
                  )}
                </div>
              </div>

              {/* Row 3: Select no. of nights & Date of Arrival */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <MultiSelect
                    options={NIGHT_OPTIONS}
                    value={nights}
                    onChange={setNights}
                    placeholder="Select no. of nights"
                    invalid={showErrors && nights.length === 0}
                  />
                  {showErrors && nights.length === 0 && (
                    <p className="text-[11px] text-red-400 mt-1">Please select at least one option.</p>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="date"
                    required
                    value={formData.travelDate}
                    onChange={(e) => setFormData({ ...formData, travelDate: e.target.value })}
                    className="w-full bg-slate-800/80 border border-slate-600 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-slate-200 focus:outline-none focus:border-primaryCyan"
                  />
                  {!formData.travelDate && (
                    <span className="absolute left-3 sm:left-4 top-2.5 sm:top-3 text-sm text-slate-500 pointer-events-none">
                      {/* Date of Arrival */}
                    </span>
                  )}
                </div>
              </div>

              {/* Row 4: Select Your Destination */}
              <div>
                <MultiSelect
                  options={tour?.title && !DESTINATION_OPTIONS.includes(tour.title) ? [tour.title, ...DESTINATION_OPTIONS] : DESTINATION_OPTIONS}
                  value={destinations}
                  onChange={setDestinations}
                  placeholder="Select Your Destination"
                  invalid={showErrors && destinations.length === 0}
                />
                {showErrors && destinations.length === 0 && (
                  <p className="text-[11px] text-red-400 mt-1">Please select at least one destination.</p>
                )}
              </div>

              {/* Row 5: reCAPTCHA Widget Simulation */}
              <div className="flex justify-center sm:justify-start my-2 sm:my-3">
                <div className="w-full max-w-[280px] p-2 bg-slate-800/80 border border-slate-600 rounded flex items-center justify-between shadow-sm">
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
              </div>

              {/* Submit Button */}
              <div className="text-center pt-1 sm:pt-2 pb-2 sm:pb-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primaryCyan hover:brightness-110 text-white px-8 sm:px-10 py-2.5 sm:py-3 rounded-lg text-sm font-semibold transition-colors inline-flex items-center justify-center gap-2 shadow-lg w-full sm:w-auto min-w-[180px] sm:min-w-[200px] touch-manipulation"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit </span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
