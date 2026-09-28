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
    <div className="py-12 bg-lightBg min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-bold hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block mb-3">
            Get In Touch
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-navyBlue tracking-tight mb-3">
            Contact Exporio Holidays
          </h1>
          <p className="text-steelGray text-sm md:text-base">
            Have questions about tour packages, permits, or custom itineraries? Our travel specialists are available 24/7.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Details Cards */}
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-navyBlue">Phone & WhatsApp</h4>
                <a href="tel:+919811980218" className="text-xs text-slate-600 hover:text-blue-600 block mt-1 font-semibold">
                  +91 9811980218 (24/7 Support)
                </a>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-navyBlue">Email Address</h4>
                <a href="mailto:contact@exporioholidays.com" className="text-xs text-slate-600 hover:text-blue-600 block mt-1 font-semibold">
                  contact@exporioholidays.com
                </a>
                <a href="mailto:contact@etripto.in" className="text-xs text-slate-400 hover:text-blue-600 block mt-0.5">
                  contact@etripto.in
                </a>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-navyBlue">Head Office Location</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Maduari, TamilNadu - 624220, India
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-navyBlue">Working Hours</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Monday - Sunday: 9:00 AM - 9:00 PM IST
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-card">
            <h3 className="text-2xl font-extrabold text-navyBlue mb-2">Send Us a Message</h3>
            <p className="text-xs text-slate-500 mb-6">Fill out the form below and our team will get back to you within 15 minutes.</p>

            {submitted ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="text-lg font-bold text-emerald-900">Message Received!</h4>
                <p className="text-xs text-emerald-700">Thank you for reaching out to Exporio Holidays. We will contact you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Message / Inquiry Details</label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your travel requirements or questions here..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-navyBlue hover:bg-navyDark text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Sending...' : 'SUBMIT INQUIRY'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
