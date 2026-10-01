'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, ArrowLeft } from 'lucide-react';
import { submitContact } from '@/lib/supabase';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await submitContact({
        name,
        email,
        phone,
        message,
      });
      setSubmitted(true);
    } catch (err) {
      alert('Error sending message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 relative min-h-screen bg-gradient-to-br from-navyDark via-navyBlue to-primaryCyan/20 text-white overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] bg-primaryCyan/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-primaryCyan font-bold hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-primaryCyan bg-primaryCyan/10 px-3 py-1 rounded-full inline-block mb-3 border border-primaryCyan/20">
            Get In Touch
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-3">
            Contact Exporio Holidays
          </h1>
          <p className="text-slate-300 text-sm md:text-base">
            Have questions about tour packages, permits, or custom itineraries? Our travel specialists are available 24/7.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Details Cards */}
          <div className="space-y-4">
            <div className="bg-navyDark/60 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primaryCyan/10 text-primaryCyan flex items-center justify-center flex-shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Phone & WhatsApp</h4>
                <a href="tel:+919811980218" className="text-xs text-slate-300 hover:text-primaryCyan block mt-1 font-semibold transition-colors">
                  +91 9811980218 (24/7 Support)
                </a>
              </div>
            </div>

            <div className="bg-navyDark/60 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primaryCyan/10 text-primaryCyan flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Email Address</h4>
                <a href="mailto:contact@exporioholidays.com" className="text-xs text-slate-300 hover:text-primaryCyan block mt-1 font-semibold transition-colors">
                  contact@exporioholidays.com
                </a>
                <a href="mailto:contact@etripto.in" className="text-xs text-slate-400 hover:text-primaryCyan block mt-0.5 transition-colors">
                  contact@etripto.in
                </a>
              </div>
            </div>

            <div className="bg-navyDark/60 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primaryCyan/10 text-primaryCyan flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Head Office Location</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Maduari, TamilNadu - 624220, India
                </p>
              </div>
            </div>

            <div className="bg-navyDark/60 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primaryCyan/10 text-primaryCyan flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Working Hours</h4>
                <p className="text-xs text-slate-300 mt-1">
                  Monday - Sunday: 9:00 AM - 9:00 PM IST
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2 bg-navyDark/60 backdrop-blur-md p-8 rounded-2xl border border-slate-700/50 shadow-card">
            <h3 className="text-2xl font-extrabold text-white mb-2">Send Us a Message</h3>
            <p className="text-xs text-slate-400 mb-6">Fill out the form below and our team will get back to you within 15 minutes.</p>

            {submitted ? (
              <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-lg font-bold text-emerald-400">Message Received!</h4>
                <p className="text-xs text-emerald-100">Thank you for reaching out to Exporio Holidays. We will contact you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primaryCyan"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primaryCyan"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primaryCyan"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Your Message / Inquiry Details</label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your travel requirements or questions here..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primaryCyan"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primaryCyan hover:brightness-110 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-glow flex items-center justify-center gap-2 transition-all w-full sm:w-auto"
                >
                  <Send className="w-4 h-4" />
                  {loading && (
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  {!loading && <span>SUBMIT INQUIRY</span>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
