'use client';

import React, { useState } from 'react';
import { X, Send, Calendar, Users, Phone, Mail, User, CheckCircle2, MessageSquare } from 'lucide-react';
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

  const [loading, setLoading] = useState(false);
  const [responseState, setResponseState] = useState<{ success?: boolean; message?: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponseState(null);

    const payload: Inquiry = {
      ...formData,
      tourId: tour?.id,
      tourTitle: tour?.title || 'General Travel Consultation',
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
      `Hello Etripto! I am interested in booking: ${tour?.title || 'Tour Package'}. My phone is ${formData.phone}`
    );
    window.open(`https://wa.me/919811980218?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-navyBlue text-white w-full max-w-lg rounded-2xl border border-slate-700 shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-navyDark px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase text-primaryCyan">Instant Tour Quote</span>
            <h3 className="text-lg font-bold text-white line-clamp-1">
              {tour ? tour.title : 'Plan Your Dream Holiday'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {responseState?.success ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-2xl font-bold text-white">Inquiry Submitted!</h4>
              <p className="text-slate-300 text-sm max-w-sm mx-auto">
                {responseState.message}
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleWhatsAppRedirect}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat on WhatsApp</span>
                </button>
                <button
                  onClick={onClose}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm px-5 py-2.5 rounded-xl"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-primaryCyan" /> Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ramesh Verma"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primaryCyan"
                />
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-primaryCyan" /> Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primaryCyan"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-primaryCyan" /> Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primaryCyan"
                  />
                </div>
              </div>

              {/* Travel Date & Guests */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-primaryCyan" /> Travel Date
                  </label>
                  <input
                    type="date"
                    value={formData.travelDate}
                    onChange={(e) => setFormData({ ...formData, travelDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primaryCyan"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-primaryCyan" /> Number of Guests
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.guestsCount}
                    onChange={(e) => setFormData({ ...formData, guestsCount: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primaryCyan"
                  />
                </div>
              </div>

              {/* Special Requirements */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Customization / Requirements</label>
                <textarea
                  rows={2}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us your preferences (e.g. Honeymoon setup, extra beds, hotel category)..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primaryCyan"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primaryCyan to-blue-600 hover:brightness-110 text-navyDark font-extrabold py-3 rounded-xl text-sm flex items-center justify-center gap-2 shadow-glow transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span>Submitting Inquiry...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>GET FREE QUOTE NOW</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
