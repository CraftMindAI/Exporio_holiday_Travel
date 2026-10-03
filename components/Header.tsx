'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, MapPin, PhoneCall, Facebook, Instagram, Youtube, LogIn, ChevronDown, ChevronRight, Menu, X, LayoutDashboard } from 'lucide-react';
import { siteConfig } from '@/config/siteConfig';
import { getCurrentUser, onAuthChange, signOutUser, CurrentUser } from '@/lib/userAuth';
import { STAFF_LOGIN_PATH, STAFF_LOGIN_URL, STATIC_DEMO, mediaUrl } from '@/lib/routes';
import { apiFetch } from '@/lib/api';

type MenuData = {
  places: { name: string; slug: string; category: string; country: string | null }[];
  packages: { title: string; slug: string; place: string | null }[];
};

const DESKTOP_LINK = 'block px-4 py-2 hover:bg-slate-800 hover:text-primaryCyan text-xs font-bold uppercase text-slate-200';
const MOBILE_LINK = 'block py-2.5 text-xs font-bold uppercase text-slate-300 hover:text-primaryCyan rounded-lg hover:bg-slate-800/50 px-3 transition-colors';
const PANEL = 'bg-navyDark/95 backdrop-blur-md border border-slate-700 rounded-xl shadow-[0_10px_40px_-10px_rgba(255,78,0,0.3)] py-2';

export default function Header({ onOpenInquiry }: { onOpenInquiry?: () => void }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tourDropdownOpen, setTourDropdownOpen] = useState(false);
  const [placeDropdownOpen, setPlaceDropdownOpen] = useState(false);
  // Only staff (admins / employees) have accounts; customers browse without signing in
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [menu, setMenu] = useState<MenuData>({ places: [], packages: [] });
  // Place hovered in the "Place To Visit" menu (desktop) / expanded (mobile)
  const [hoverPlace, setHoverPlace] = useState<string | null>(null);
  const [mobilePlace, setMobilePlace] = useState<string | null>(null);
  const packagesFor = (slug: string) => menu.packages.filter((t) => t.place === slug);

  // Header menus come from the database: Places (Tour menu) and Tour Packages (Place To Visit menu)
  React.useEffect(() => {
    apiFetch<MenuData>('/api/menu')
      .then(setMenu)
      .catch(() => undefined);
  }, []);
  const adminPath = user?.adminPath || STAFF_LOGIN_PATH;

  React.useEffect(() => {
    const refreshUser = () => getCurrentUser().then(setUser);
    refreshUser();
    return onAuthChange(refreshUser);
  }, []);

  const handleLogout = async () => {
    await signOutUser();
    setUser(null);
    if (window.location.pathname.startsWith('/auth/')) {
      window.location.href = '/';
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    // Close dropdowns when toggling main menu
    if (mobileMenuOpen) {
      setTourDropdownOpen(false);
      setPlaceDropdownOpen(false);
    }
  };

  return (
    <>
      {/* Top Bar */}
      <header className="bg-navyBlue/90 backdrop-blur-md text-white text-xs py-2 px-4 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          {/* Left contact info */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-300">
            <a href={`mailto:${siteConfig.emailAddress}`} className="flex items-center gap-1.5 hover:text-primaryCyan transition-colors">
              <Mail className="w-3.5 h-3.5 text-primaryCyan" />
              <span className="hidden xs:inline sm:inline">{siteConfig.emailAddress}</span>
              <span className="xs:hidden sm:hidden">Email Us</span>
            </a>
            <div className="hidden md:flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primaryCyan" />
              <span>{siteConfig.headOfficeAddress}</span>
            </div>
          </div>

          {/* Right socials & ONLY Sign In button */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 pr-3 sm:pr-4 border-r border-slate-700">
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

            {/* Staff sign-in (admins / employees) or, when signed in, a quick link to the dashboard */}
            {/* The standalone demo has no server, so no staff sign-in */}
            {!user && !STATIC_DEMO && (
              <Link
                href={STAFF_LOGIN_URL}
                className="flex items-center gap-1 hover:text-primaryCyan transition-colors font-medium bg-slate-800/80 px-3 py-1 rounded-md border border-slate-700"
              >
                <LogIn className="w-3.5 h-3.5 text-primaryCyan" />
                <span>Sign In</span>
              </Link>
            )}
            {user && (
              <div className="flex items-center gap-2">
                <Link
                  href={adminPath}
                  className="flex items-center gap-1 hover:text-primaryCyan transition-colors font-medium bg-slate-800/80 px-3 py-1 rounded-md border border-slate-700"
                  title={`${user.name} (${user.role})`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-primaryCyan" />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 hover:text-red-400 transition-colors font-medium bg-red-900/30 text-red-200 px-3 py-1 rounded-md border border-red-800/50"
                  title="Logout"
                >
                  <LogIn className="w-3.5 h-3.5 rotate-180" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Navigation */}
      <nav className="bg-navyDark/90 backdrop-blur-md text-white shadow-[0_10px_30px_-10px_rgba(255,78,0,0.2)] relative z-40 border-b border-primaryCyan/20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center">
            <img
              src={mediaUrl('/exporio-logo-white.png')}
              alt="Exporio Holidays"
              className="h-11 sm:h-14 w-auto object-contain"
            />
          </Link>

          {/* Desktop Nav Links */}
          <ul className="hidden lg:flex items-center gap-8 text-sm font-extrabold uppercase tracking-wider text-slate-100">
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
              <div className="absolute top-full left-0 mt-2 w-72 max-h-96 overflow-y-auto bg-navyDark/95 backdrop-blur-md border border-slate-700 rounded-xl shadow-[0_10px_40px_-10px_rgba(255,78,0,0.3)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 z-50">
                {menu.places.length === 0 ? (
                  <span className="block px-4 py-2 text-xs text-slate-500 normal-case">No places yet</span>
                ) : (
                  menu.places.map((p) => (
                    <Link key={p.slug} href={`/location/${p.slug}/`} className={DESKTOP_LINK}>
                      {p.name}
                      {p.category === 'international' && p.country ? <span className="text-slate-500 font-semibold"> · {p.country}</span> : null}
                    </Link>
                  ))
                )}
              </div>
            </li>
            <li className="relative group cursor-pointer" onMouseLeave={() => setHoverPlace(null)}>
              <span className="flex items-center gap-1 hover:text-primaryCyan transition-colors">
                Place To Visit <ChevronDown className="w-4 h-4" />
              </span>
              {/* Places, and on hover a flyout with that place's packages */}
              <div className="absolute top-full left-0 pt-2 flex items-start opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className={`${PANEL} w-64 max-h-96 overflow-y-auto`}>
                  {menu.places.length === 0 ? (
                    <span className="block px-4 py-2 text-xs text-slate-500 normal-case">No places yet</span>
                  ) : (
                    menu.places.map((p) => (
                      <Link
                        key={p.slug}
                        href={`/location/${p.slug}/`}
                        onMouseEnter={() => setHoverPlace(p.slug)}
                        onFocus={() => setHoverPlace(p.slug)}
                        className={`${DESKTOP_LINK} flex items-center justify-between gap-2 ${hoverPlace === p.slug ? 'bg-slate-800 text-primaryCyan' : ''}`}
                      >
                        {p.name}
                        <ChevronRight className="w-4 h-4 shrink-0" />
                      </Link>
                    ))
                  )}
                </div>
                {hoverPlace && (
                  <div className={`${PANEL} w-72 max-h-96 overflow-y-auto -ml-px`}>
                    {packagesFor(hoverPlace).length === 0 ? (
                      <span className="block px-4 py-2 text-xs text-slate-500 normal-case">No packages yet</span>
                    ) : (
                      packagesFor(hoverPlace).map((t) => (
                        <Link key={t.slug} href={`/tour/${t.slug}/`} className={`${DESKTOP_LINK} leading-relaxed`}>
                          {t.title}
                        </Link>
                      ))
                    )}
                  </div>
                )}
              </div>
            </li>
            <li>
              <Link href="/stranger-trip/" className="hover:text-primaryCyan transition-colors">
                Stranger Trip
              </Link>
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

          </ul>

          {/* Right Phone Call CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href={siteConfig.phoneCallUrl}
              aria-label={`Call ${siteConfig.phoneNumber}`}
              className="relative w-11 h-11 rounded-full bg-gradient-to-br from-primaryCyan to-accentOrange text-white flex items-center justify-center shadow-glow hover:scale-105 transition-transform"
            >
              <span className="absolute inset-0 rounded-full bg-primaryCyan/40 animate-ping" />
              <PhoneCall className="relative w-5 h-5" strokeWidth={2.25} />
            </a>
            <div>
              <a href={siteConfig.phoneCallUrl} className="font-extrabold text-base text-white hover:text-primaryCyan transition-colors block leading-tight">
                {siteConfig.phoneNumber}
              </a>
              <span className="text-[11px] font-bold text-slate-400">24/7 Customer Support</span>
            </div>
          </div>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 text-slate-300 hover:text-primaryCyan touch-manipulation"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Nav */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-navyBlue/95 backdrop-blur-md border-t border-slate-800 px-4 py-4 space-y-1 max-h-[calc(100dvh-120px)] overflow-y-auto no-scrollbar safe-bottom">
            <Link href="/" className="block py-3 text-sm font-semibold hover:text-primaryCyan rounded-lg hover:bg-slate-800/50 px-3 transition-colors">
              Home
            </Link>

            {/* Tour Packages Accordion */}
            <div className="border-t border-slate-800/50">
              <button
                onClick={() => setTourDropdownOpen(!tourDropdownOpen)}
                className="w-full flex items-center justify-between py-3 text-sm font-semibold hover:text-primaryCyan rounded-lg hover:bg-slate-800/50 px-3 transition-colors"
              >
                <span>Tour Packages</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${tourDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {tourDropdownOpen && (
                <div className="pl-4 space-y-1 pb-2">
                  {menu.places.length === 0 ? (
                    <span className="block py-2.5 px-3 text-xs text-slate-500">No places yet</span>
                  ) : (
                    menu.places.map((p) => (
                      <Link key={p.slug} href={`/location/${p.slug}/`} className={MOBILE_LINK} onClick={() => setMobileMenuOpen(false)}>
                        {p.name}
                        {p.category === 'international' && p.country ? <span className="text-slate-500"> · {p.country}</span> : null}
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Place To Visit Accordion */}
            <div className="border-t border-slate-800/50">
              <button
                onClick={() => setPlaceDropdownOpen(!placeDropdownOpen)}
                className="w-full flex items-center justify-between py-3 text-sm font-semibold hover:text-primaryCyan rounded-lg hover:bg-slate-800/50 px-3 transition-colors"
              >
                <span>Place To Visit</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${placeDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {placeDropdownOpen && (
                <div className="pl-4 space-y-1 pb-2">
                  {menu.places.length === 0 ? (
                    <span className="block py-2.5 px-3 text-xs text-slate-500">No places yet</span>
                  ) : (
                    menu.places.map((p) => (
                      <div key={p.slug}>
                        <button
                          type="button"
                          onClick={() => setMobilePlace(mobilePlace === p.slug ? null : p.slug)}
                          aria-expanded={mobilePlace === p.slug}
                          className={`${MOBILE_LINK} w-full flex items-center justify-between`}
                        >
                          {p.name}
                          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobilePlace === p.slug ? 'rotate-180' : ''}`} />
                        </button>
                        {mobilePlace === p.slug && (
                          <div className="pl-4 pb-1">
                            {packagesFor(p.slug).length === 0 ? (
                              <span className="block py-2 px-3 text-xs text-slate-500">No packages yet</span>
                            ) : (
                              packagesFor(p.slug).map((t) => (
                                <Link key={t.slug} href={`/tour/${t.slug}/`} className={MOBILE_LINK} onClick={() => setMobileMenuOpen(false)}>
                                  {t.title}
                                </Link>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <Link href="/stranger-trip/" className="block py-3 text-sm font-semibold hover:text-primaryCyan rounded-lg hover:bg-slate-800/50 px-3 transition-colors border-t border-slate-800/50">
              Stranger Trip
            </Link>
            <Link href="/contact" className="block py-3 text-sm font-semibold hover:text-primaryCyan rounded-lg hover:bg-slate-800/50 px-3 transition-colors">
              Contact Us
            </Link>
            <Link href="/news" className="block py-3 text-sm font-semibold hover:text-primaryCyan rounded-lg hover:bg-slate-800/50 px-3 transition-colors">
              Blogs
            </Link>

            <div className="pt-3 mt-2 border-t border-slate-700 flex items-center gap-3 px-3">
              <PhoneCall className="w-5 h-5 text-primaryCyan" />
              <a href={siteConfig.phoneCallUrl} className="font-bold text-sm text-white">
                {siteConfig.phoneNumber} (24/7 Support)
              </a>
            </div>
          </div>
        )}
      </nav>

    </>
  );
}
