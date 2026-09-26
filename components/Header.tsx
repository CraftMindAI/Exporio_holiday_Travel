'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, MapPin, Phone, Facebook, Instagram, Youtube, LogIn, ChevronDown, Menu, X, ShieldAlert, Plane } from 'lucide-react';
import { siteConfig } from '@/config/siteConfig';

export default function Header({ onOpenInquiry }: { onOpenInquiry?: () => void }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModal, setAuthModal] = useState<boolean>(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMessage, setAuthMessage] = useState('');

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authEmail === 'admin@exporio.com' && authPassword === 'admin123') {
      setAuthMessage('Admin login successful! Redirecting to Admin Dashboard...');
      setTimeout(() => {
        setAuthModal(false);
        window.location.href = '/admin';
      }, 1000);
    } else {
      setAuthMessage(`Signed in as ${authEmail}`);
      setTimeout(() => {
        setAuthModal(false);
        setAuthMessage('');
      }, 1500);
    }
  };

  return (
    <>
      {/* Top Bar */}
      <header className="bg-navyBlue text-white text-xs py-2 px-4 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          {/* Left contact info */}
          <div className="flex flex-wrap items-center gap-4 text-slate-300">
            <a href={`mailto:${siteConfig.emailAddress}`} className="flex items-center gap-1.5 hover:text-primaryCyan transition-colors">
              <Mail className="w-3.5 h-3.5 text-primaryCyan" />
              <span>{siteConfig.emailAddress}</span>
            </a>
            <div className="hidden sm:flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primaryCyan" />
              <span>{siteConfig.headOfficeAddress}</span>
            </div>
          </div>

          {/* Right socials & ONLY Sign In button */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 pr-4 border-r border-slate-700">
              <a href={siteConfig.socialLinks.facebook} target="_blank" rel="noreferrer" className="p-1 hover:text-primaryCyan transition-colors" title="Facebook">
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a href={siteConfig.socialLinks.instagram} target="_blank" rel="noreferrer" className="p-1 hover:text-primaryCyan transition-colors" title="Instagram">
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a href={siteConfig.socialLinks.youtube} target="_blank" rel="noreferrer" className="p-1 hover:text-primaryCyan transition-colors" title="YouTube">
                <Youtube className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* ONLY Sign In button */}
            <button
              onClick={() => setAuthModal(true)}
              className="flex items-center gap-1 hover:text-primaryCyan transition-colors font-medium bg-slate-800/80 px-3 py-1 rounded-md border border-slate-700"
            >
              <LogIn className="w-3.5 h-3.5 text-primaryCyan" />
              <span>Sign In</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Navigation */}
      <nav className="bg-navyDark text-white shadow-lg relative z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-primaryCyan via-blue-600 to-navyDark flex items-center justify-center font-black text-white text-xl shadow-glow border border-slate-700 relative">
              <Plane className="w-6 h-6 transform -rotate-45 text-white" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-black text-2xl tracking-tight uppercase text-white">
                  EXPORIO
                </span>
                <span className="font-light text-xs tracking-widest uppercase text-primaryCyan border-l border-slate-600 pl-1.5">
                  HOLIDAYS
                </span>
              </div>
              <p className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">
                {siteConfig.tagline}
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <ul className="hidden lg:flex items-center gap-8 text-sm font-semibold uppercase tracking-wider">
            <li>
              <Link href="/" className="hover:text-primaryCyan transition-colors">
                Home
              </Link>
            </li>
            <li className="relative group cursor-pointer">
              <span className="flex items-center gap-1 hover:text-primaryCyan transition-colors">
                Tour <ChevronDown className="w-4 h-4" />
              </span>
              {/* Dropdown */}
              <div className="absolute top-full left-0 mt-2 w-56 bg-navyBlue border border-slate-700 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 visibility-hidden group-hover:visible transition-all duration-200 py-2">
                <Link href="/location/sikkim-tour-package" className="block px-4 py-2 hover:bg-slate-800 hover:text-primaryCyan text-xs capitalize">
                  Sikkim & Gangtok Packages
                </Link>
                <Link href="/location/kashmir-tour-package" className="block px-4 py-2 hover:bg-slate-800 hover:text-primaryCyan text-xs capitalize">
                  Kashmir Paradise Packages
                </Link>
                <Link href="/location/darjeeling-tour-packages" className="block px-4 py-2 hover:bg-slate-800 hover:text-primaryCyan text-xs capitalize">
                  Darjeeling Tour Packages
                </Link>
                <Link href="/location/kerala-tour-packages" className="block px-4 py-2 hover:bg-slate-800 hover:text-primaryCyan text-xs capitalize">
                  Kerala Backwaters
                </Link>
                <Link href="/location/andaman-tour-package" className="block px-4 py-2 hover:bg-slate-800 hover:text-primaryCyan text-xs capitalize">
                  Andaman Islands
                </Link>
              </div>
            </li>
            <li className="relative group cursor-pointer">
              <span className="flex items-center gap-1 hover:text-primaryCyan transition-colors">
                Place To Visit <ChevronDown className="w-4 h-4" />
              </span>
              <div className="absolute top-full left-0 mt-2 w-56 bg-navyBlue border border-slate-700 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 visibility-hidden group-hover:visible transition-all duration-200 py-2">
                <Link href="/location/bhutan-tour-packages" className="block px-4 py-2 hover:bg-slate-800 hover:text-primaryCyan text-xs capitalize">
                  Bhutan Himalayan Tour
                </Link>
                <Link href="/location/bali-tour-packages" className="block px-4 py-2 hover:bg-slate-800 hover:text-primaryCyan text-xs capitalize">
                  Bali Island Escape
                </Link>
                <Link href="/location/shimla-manali-tour-package" className="block px-4 py-2 hover:bg-slate-800 hover:text-primaryCyan text-xs capitalize">
                  Shimla Manali Package
                </Link>
              </div>
            </li>
            <li>
              <Link href="/contact" className="hover:text-primaryCyan transition-colors">
                Contact Us
              </Link>
            </li>
            <li>
              <Link href="/news" className="hover:text-primaryCyan transition-colors">
                Blogs
              </Link>
            </li>
            <li>
              <Link href="/admin" className="hover:text-primaryCyan transition-colors flex items-center gap-1 text-accentGold font-bold">
                <ShieldAlert className="w-4 h-4" />
                <span>Leads Admin</span>
              </Link>
            </li>
          </ul>

          {/* Right Phone Call CTA */}
          <div className="hidden md:flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primaryCyan/20 text-primaryCyan flex items-center justify-center">
              <Phone className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <a href={siteConfig.phoneCallUrl} className="font-extrabold text-base text-white hover:text-primaryCyan transition-colors block leading-tight">
                {siteConfig.phoneNumber}
              </a>
              <span className="text-[11px] text-slate-400">24/7 Customer Support</span>
            </div>
          </div>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Nav */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-navyBlue border-t border-slate-800 px-4 py-4 space-y-3">
            <Link href="/" className="block py-2 text-sm font-semibold hover:text-primaryCyan">
              Home
            </Link>
            <Link href="/location/sikkim-tour-package" className="block py-2 text-sm font-semibold hover:text-primaryCyan">
              Tour Packages
            </Link>
            <Link href="/contact" className="block py-2 text-sm font-semibold hover:text-primaryCyan">
              Contact Us
            </Link>
            <Link href="/news" className="block py-2 text-sm font-semibold hover:text-primaryCyan">
              Blogs
            </Link>
            <Link href="/admin" className="block py-2 text-sm font-semibold text-accentGold hover:text-white">
              Leads Admin Dashboard
            </Link>
            <div className="pt-3 border-t border-slate-700 flex items-center gap-3">
              <Phone className="w-5 h-5 text-primaryCyan" />
              <a href={siteConfig.phoneCallUrl} className="font-bold text-sm text-white">
                {siteConfig.phoneNumber} (24/7 Support)
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Sign In Modal */}
      {authModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navyBlue text-white w-full max-w-md p-6 rounded-2xl border border-slate-700 shadow-2xl relative">
            <button
              onClick={() => setAuthModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-white mb-2">
              Sign In to Exporio Holidays
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Enter your credentials to access your account or Admin Dashboard.
            </p>

            {authMessage ? (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500 text-emerald-300 rounded-lg text-sm mb-4">
                {authMessage}
              </div>
            ) : null}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="admin@exporio.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primaryCyan"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primaryCyan"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-primaryCyan to-blue-600 text-navyDark font-bold py-2.5 rounded-lg text-sm hover:brightness-110 transition-all shadow-glow"
              >
                Sign In
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
