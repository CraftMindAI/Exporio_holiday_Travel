'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Send, CheckCircle2, Facebook, Instagram, Youtube, Plane } from 'lucide-react';
import { requestSubscription } from '@/lib/api';
import { toast } from '@/lib/toast';
import { siteConfig, FOOTER_LOCATIONS } from '@/config/siteConfig';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    const res = await requestSubscription(email);
    toast.result(res);
    setSubmitting(false);
    if (res.success) setEmail('');
  };

  return (
    <footer className="bg-navyDark/90 backdrop-blur-md text-slate-300 pt-12 sm:pt-16 pb-6 sm:pb-8 border-t border-slate-800 relative z-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {/* Col 1: About */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center">
              <img
                src="/exporio-logo-white.png"
                alt="Exporio Holidays"
                className="h-14 w-auto object-contain"
              />

            </Link>

            <p className="text-xs text-slate-400 leading-relaxed">
              Exporio Holidays is a leading tour and travel company dedicated to crafting customized holiday experiences across domestic & international destinations including Sikkim, Kashmir, Darjeeling, Kerala, Andaman, Bhutan, Bali, and beyond.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a href={siteConfig.socialLinks.facebook} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-slate-800 hover:bg-primaryCyan hover:text-navyDark flex items-center justify-center transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href={siteConfig.socialLinks.instagram} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-slate-800 hover:bg-primaryCyan hover:text-navyDark flex items-center justify-center transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href={siteConfig.socialLinks.youtube} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-slate-800 hover:bg-primaryCyan hover:text-navyDark flex items-center justify-center transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Need Help / Contact */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              Need Assistance?
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-primaryCyan flex-shrink-0 mt-0.5" />
                <div>
                  <span className="block font-semibold text-slate-200">Call Us 24/7:</span>
                  <a href={siteConfig.phoneCallUrl} className="hover:text-primaryCyan transition-colors">
                    {siteConfig.phoneNumber}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-primaryCyan flex-shrink-0 mt-0.5" />
                <div>
                  <span className="block font-semibold text-slate-200">Email Us:</span>
                  <a href={`mailto:${siteConfig.emailAddress}`} className="hover:text-primaryCyan transition-colors">
                    {siteConfig.emailAddress}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primaryCyan flex-shrink-0 mt-0.5" />
                <div>
                  <span className="block font-semibold text-slate-200">Head Office:</span>
                  <span>{siteConfig.headOfficeAddress}</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              Popular Tour Packages
            </h4>
            <ul className="space-y-1.5 text-xs">
              {FOOTER_LOCATIONS.map((l) => (
                <li key={l.slug}>
                  <Link href={`/location/${l.slug}/`} className="hover:text-primaryCyan transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              Travel Beyond Borders!
            </h4>
            <p className="text-xs text-slate-400">
              Subscribe to Exporio Holidays newsletter to receive exclusive travel deals and itineraries in your inbox.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl overflow-hidden p-1">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email*"
                    className="w-full bg-transparent text-xs text-white px-3 py-2 placeholder-slate-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-primaryCyan text-navyDark font-extrabold text-xs px-4 py-2 rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-1"
                  >
                    {submitting ? (
                      <svg className="animate-spin h-4 w-4 text-navyDark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <span>Subscribe</span>
                    )}
                  </button>
                </div>
              </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 sm:pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-[11px] sm:text-xs text-slate-500 gap-3 sm:gap-4">
          <p>© {new Date().getFullYear()} Exporio Holidays. All Rights Reserved.</p>
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 sm:gap-4 text-center">
            <Link href="/" className="hover:text-slate-400">Privacy Policy</Link>
            <Link href="/" className="hover:text-slate-400">Terms & Conditions</Link>
            <Link href="/" className="hover:text-slate-400">Cancellation & Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
