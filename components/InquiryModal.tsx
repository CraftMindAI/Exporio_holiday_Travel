'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, MessageSquare, RefreshCcw } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);
  const [responseState, setResponseState] = useState<{ success?: boolean; message?: string } | null>(null);

  // Update destination if tour changes
  React.useEffect(() => {
    if (tour?.title) {
      setDestination(tour.title);
    }
  }, [tour]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponseState(null);

    const payload: Inquiry = {
      ...formData,
      tourId: tour?.id,
      tourTitle: destination || 'General Travel Consultation',
      message: nights ? `${nights} nights. ${formData.message}` : formData.message
    };

    try {
      const res = await submitInquiry(payload);
      setResponseState(res);
    } catch (err: any) {
      setResponseState({ success: false, message: 'Failed to submit inquiry. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppRedirect = () => {
    const text = encodeURIComponent(
      `Hello Etripto! I am interested in booking: ${destination || 'Tour Package'}. My phone is ${formData.phone}`
    );
    window.open(`https://wa.me/919811980218?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-sm shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">

        {/* Top Image Banner */}
        <div className="relative h-48 w-full bg-slate-200">
          <img
            src={tour?.imageUrl || "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1920&q=80"}
            alt="Destination"
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 bg-white/80 hover:bg-white text-slate-800 rounded-full shadow-md transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8">
          {responseState?.success ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-2xl font-bold text-navyBlue">Inquiry Submitted!</h4>
              <p className="text-slate-600 text-sm max-w-sm mx-auto">
                {responseState.message}
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleWhatsAppRedirect}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm px-6 py-2.5 rounded shadow flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat on WhatsApp</span>
                </button>
                <button
                  onClick={onClose}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-sm px-6 py-2.5 rounded shadow-sm"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Name"
                  className="w-full bg-white border border-slate-300 rounded px-4 py-3 text-sm text-slate-800 placeholder-blue-600/70 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Email Id"
                  className="w-full bg-white border border-slate-300 rounded px-4 py-3 text-sm text-slate-800 placeholder-blue-600/70 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Contact Number"
                  className="w-full bg-white border border-slate-300 rounded px-4 py-3 text-sm text-slate-800 placeholder-blue-600/70 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="number"
                  min="1"
                  value={formData.guestsCount || ''}
                  onChange={(e) => setFormData({ ...formData, guestsCount: parseInt(e.target.value) || 1 })}
                  placeholder="No. of People"
                  className="w-full bg-white border border-slate-300 rounded px-4 py-3 text-sm text-slate-800 placeholder-blue-600/70 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  value={nights}
                  onChange={(e) => setNights(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-4 py-3 text-sm text-blue-600/70 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
                >
                  <option value="" disabled hidden>Select no. of nights</option>
                  <option value="2 Nights">2 Nights</option>
                  <option value="3 Nights">3 Nights</option>
                  <option value="4 Nights">4 Nights</option>
                  <option value="5+ Nights">5+ Nights</option>
                </select>
                <div className="relative">
                  <span className="absolute left-4 top-1 text-[10px] text-blue-600/70 font-semibold">Date of Arrival</span>
                  <input
                    type="date"
                    value={formData.travelDate}
                    onChange={(e) => setFormData({ ...formData, travelDate: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-4 pt-5 pb-1.5 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-4 py-3 text-sm text-blue-600/70 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
              >
                <option value="" disabled hidden>Select Your Destination</option>
                {tour && <option value={tour.title}>{tour.title}</option>}
                <option value="Kashmir">Kashmir</option>
                <option value="Sikkim">Sikkim</option>
                <option value="Andaman">Andaman</option>
                <option value="Kerala">Kerala</option>
                <option value="Bali">Bali</option>
                <option value="Other">Other / Not Sure</option>
              </select>

              {/* Fake reCAPTCHA */}
              <div className="inline-flex items-center gap-3 p-3 border border-slate-300 rounded bg-slate-50 w-auto min-w-[240px] mt-2 shadow-sm">
                <input type="checkbox" className="w-6 h-6 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" required />
                <span className="text-sm text-slate-700">I'm not a robot</span>
                <div className="ml-auto flex flex-col items-center">
                  <RefreshCcw className="w-6 h-6 text-blue-500" />
                  <span className="text-[9px] text-slate-500 mt-0.5">reCAPTCHA</span>
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-center mt-6 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#00E5FF] hover:bg-[#00cce6] text-slate-900 font-semibold px-8 py-3 rounded text-sm shadow-md transition-all disabled:opacity-50 min-w-[200px]"
                >
                  {loading ? 'Sending...' : 'Send Me Details'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
