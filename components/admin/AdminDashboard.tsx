'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard, MessageSquareText, Mail, Users, Settings, Plane, MapPin, BookOpen,
  LogOut, Menu, X, ExternalLink,
} from 'lucide-react';
import { adminLogout, AdminSession } from '@/lib/adminAuth';
import { STAFF_LOGIN_PATH } from '@/lib/routes';
import DashboardHome from '@/components/admin/DashboardHome';
import InquiriesPanel from '@/components/admin/InquiriesPanel';
import SubscriptionsPanel from '@/components/admin/SubscriptionsPanel';
import EmployeesPanel from '@/components/admin/EmployeesPanel';
import SettingsPanel from '@/components/admin/SettingsPanel';
import ContentManager from '@/components/admin/ContentManager';

export type AdminSectionId = 'dashboard' | 'inquiries' | 'subscriptions' | 'employees' | 'tours' | 'places' | 'blogs' | 'settings';

type NavItem = { id: AdminSectionId; label: string; icon: React.ElementType; adminOnly?: boolean };

const NAV: { group?: string; items: NavItem[] }[] = [
  {
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'inquiries', label: 'Inquiry', icon: MessageSquareText },
      { id: 'subscriptions', label: 'Subscription', icon: Mail },
      { id: 'employees', label: 'Employees', icon: Users, adminOnly: true },
      { id: 'places', label: 'Places', icon: MapPin },
      { id: 'tours', label: 'Tour Packages', icon: Plane },
      { id: 'blogs', label: 'Blogs', icon: BookOpen },
      { id: 'settings', label: 'Settings', icon: Settings }
    
    ],
  },
 
];

/** The sidebar for a role: employees don't see admin-only sections. */
function navFor(isAdmin: boolean) {
  return NAV.map((g) => ({ ...g, items: g.items.filter((i) => isAdmin || !i.adminOnly) })).filter((g) => g.items.length);
}

/** Section from the URL hash, falling back to the dashboard for unknown or not-allowed sections. */
function sectionFromHash(isAdmin: boolean): AdminSectionId {
  const id = window.location.hash.replace('#', '') as AdminSectionId;
  return navFor(isAdmin).some((g) => g.items.some((i) => i.id === id)) ? id : 'dashboard';
}

/**
 * Admin dashboard at /auth/profile/v1/<hashed-user-id>/.
 * The page (server component) has already verified the admin session before rendering this.
 */
export default function AdminDashboard({ admin: initialAdmin }: { admin: AdminSession }) {
  const [admin, setAdmin] = useState<AdminSession>(initialAdmin);
  const [section, setSection] = useState<AdminSectionId>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isAdmin = admin.role === 'admin';
  const nav = navFor(isAdmin);

  // The active section lives in the URL hash so refresh / back keep it
  useEffect(() => {
    const onHash = () => setSection(sectionFromHash(isAdmin));
    onHash();
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [isAdmin]);

  const navigate = (id: AdminSectionId) => {
    setSection(id);
    setSidebarOpen(false);
    window.history.replaceState(null, '', `${window.location.pathname}#${id}`);
    document.getElementById('admin-main')?.scrollTo({ top: 0 });
  };

  const handleLogout = async () => {
    await adminLogout();
    window.location.replace(STAFF_LOGIN_PATH);
  };

  const current = nav.flatMap((g) => g.items).find((i) => i.id === section) ?? nav[0].items[0];

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 border-b border-slate-800 flex items-center justify-between">
        <Link href="/" title="Go to website" className="block">
          <img src="/exporio-logo-white.png" alt="Exporio Holidays" className="h-10 w-auto object-contain" />
        </Link>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white" aria-label="Close menu">
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5" aria-label="Admin">
        {nav.map((group, gi) => (
          <div key={gi}>
            {group.group && <p className="px-3 mb-1.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">{group.group}</p>}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active = item.id === section;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => navigate(item.id)}
                      aria-current={active ? 'page' : undefined}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        active ? 'bg-primaryCyan text-navyDark shadow-glow' : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                      }`}
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-800 p-4 space-y-3">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-full bg-primaryCyan/15 text-primaryCyan flex items-center justify-center text-sm font-black flex-shrink-0">
            {admin.name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <div className="text-sm font-bold text-white truncate">{admin.name}</div>
            <div className="text-[11px] text-slate-400 truncate">{admin.email}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-primaryCyan mt-0.5">{admin.role}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 text-xs font-bold text-red-200 bg-red-900/30 hover:bg-red-900/60 border border-red-800/50 rounded-xl py-2"
        >
          <LogOut className="w-3.5 h-3.5" /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex bg-gradient-to-br from-navyDark via-[#141440] to-[#1f1640] text-white overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0 bg-navyDark/80 border-r border-slate-800">{sidebar}</aside>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-72 max-w-[85vw] bg-navyDark border-r border-slate-800">{sidebar}</aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-slate-800 bg-navyDark/60 backdrop-blur-md">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-slate-300 hover:text-white" aria-label="Open menu">
              <Menu className="w-5 h-5" />
            </button>
            <current.icon className="w-4 h-4 text-primaryCyan flex-shrink-0" />
            <span className="text-sm font-bold truncate">{current.label}</span>
          </div>
          <Link href="/" className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-primaryCyan flex-shrink-0">
            View website <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </header>

        <main id="admin-main" className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
          {section === 'dashboard' && <DashboardHome adminName={admin.name} isAdmin={isAdmin} onNavigate={navigate} />}
          {section === 'inquiries' && <InquiriesPanel />}
          {section === 'subscriptions' && <SubscriptionsPanel />}
          {section === 'employees' && isAdmin && <EmployeesPanel currentUserId={admin.id} />}
          {(section === 'tours' || section === 'places' || section === 'blogs') && <ContentManager key={section} section={section} />}
          {section === 'settings' && <SettingsPanel admin={admin} isAdmin={isAdmin} onProfileUpdated={setAdmin} />}
        </main>
      </div>
    </div>
  );
}
