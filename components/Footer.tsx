'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Send, CheckCircle2, Facebook, Instagram, Youtube, Plane } from 'lucide-react';
import { subscribeNewsletter } from '@/lib/supabase';
import { siteConfig } from '@/config/siteConfig';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subStatus, setSubStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    const res = await subscribeNewsletter(email);
    setSubStatus(res);
    setSubmitting(false);
    setEmail('');
  };

  return (
    <footer className="bg-navyDark text-slate-300 pt-16 pb-8 border-t border-slate-800 relative z-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Col 1: About */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primaryCyan to-blue-600 flex items-center justify-center font-bold text-white text-lg border border-slate-700 shadow-glow">
                <Plane className="w-5 h-5 transform -rotate-45 text-white" />
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="font-black text-xl tracking-tight uppercase text-white">
                    EXPORIO
                  </span>
                  <span className="font-light text-xs tracking-widest uppercase text-primaryCyan pl-1">
                    HOLIDAYS
                  </span>
                </div>
                <p className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">
                  {siteConfig.tagline}
                </p>
              </div>
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
              <li>
                <Link href="/location/sikkim-tour-package" className="hover:text-primaryCyan transition-colors">
                  Sikkim Tour Packages
                </Link>
              </li>
              <li>
                <Link href="/location/kashmir-tour-package" className="hover:text-primaryCyan transition-colors">
                  Kashmir Tour Packages
                </Link>
              </li>
              <li>
                <Link href="/location/darjeeling-tour-packages" className="hover:text-primaryCyan transition-colors">
                  Darjeeling Tour Packages
                </Link>
              </li>
              <li>
                <Link href="/location/kerala-tour-packages" className="hover:text-primaryCyan transition-colors">
                  Kerala Tour Packages
                </Link>
              </li>
              <li>
                <Link href="/location/andaman-tour-package" className="hover:text-primaryCyan transition-colors">
                  Andaman Tour Packages
                </Link>
              </li>
              <li>
                <Link href="/location/bhutan-tour-packages" className="hover:text-primaryCyan transition-colors">
                  Bhutan Tour Packages
                </Link>
              </li>
              <li>
                <Link href="/location/bali-tour-packages" className="hover:text-primaryCyan transition-colors">
                  Bali Tour Packages
                </Link>
              </li>
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

            {subStatus?.success ? (
              <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-1.5 border border-emerald-500/30">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{subStatus.message}</span>
              </div>
            ) : (
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
                    className="bg-primaryCyan text-navyDark font-extrabold text-xs px-4 py-2 rounded-lg hover:brightness-110 transition-all flex items-center gap-1"
                  >
                    <span>Subscribe</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Exporio Holidays. All Rights Reserved.</p>
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-4 text-center">
            <Link href="/" className="hover:text-slate-400">Privacy Policy</Link>
            <Link href="/" className="hover:text-slate-400">Terms & Conditions</Link>
            <Link href="/" className="hover:text-slate-400">Cancellation & Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
