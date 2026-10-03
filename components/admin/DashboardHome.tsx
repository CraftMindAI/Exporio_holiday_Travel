'use client';

import React, { useEffect, useState } from 'react';
import { MessageSquareText, Mail, Users, Plane, ArrowRight, MapPin } from 'lucide-react';
import { fetchInquiries, fetchSubscribers, fetchEmployees, countRows, InquiryRow, INQUIRY_STATUSES } from '@/lib/adminData';
import { PanelHeader, LoadingState, formatDate } from '@/components/admin/ui';
import type { AdminSectionId } from '@/components/admin/AdminDashboard';

type Stats = {
  inquiries: InquiryRow[];
  subscribers: number;
  /** Staff accounts (admins) or places (employees) */
  fourth: number;
  tours: number;
  newThisWeek: { inquiries: number; subscribers: number };
};

const STATUS_BAR: Record<string, string> = {
  pending: 'bg-amber-400',
  contacted: 'bg-sky-400',
  confirmed: 'bg-emerald-400',
  cancelled: 'bg-red-400',
};

function withinDays(value: string | null | undefined, days: number) {
  return !!value && Date.now() - new Date(value).getTime() <= days * 86_400_000;
}

/** Run a loader, but don't let one failing table blank the whole dashboard. */
async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

export default function DashboardHome({ adminName, isAdmin, onNavigate }: { adminName: string; isAdmin: boolean; onNavigate: (id: AdminSectionId) => void }) {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    (async () => {
      const [inquiries, subscribers, fourth, tours] = await Promise.all([
        safe(fetchInquiries, []),
        safe(fetchSubscribers, []),
        isAdmin ? safe(async () => (await fetchEmployees()).length, 0) : safe(() => countRows('destinations'), 0),
        safe(() => countRows('tours'), 0),
      ]);
      setStats({
        inquiries,
        subscribers: subscribers.length,
        fourth,
        tours,
        newThisWeek: {
          inquiries: inquiries.filter((i) => withinDays(i.created_at, 7)).length,
          subscribers: subscribers.filter((s) => withinDays(s.subscribed_at, 7)).length,
        },
      });
    })();
  }, [isAdmin]);

  const firstName = adminName.split(' ')[0];

  if (!stats) {
    return (
      <div>
        <PanelHeader title={`Welcome back, ${firstName}`} description="Here's what's happening on Exporio Holidays." />
        <LoadingState label="Loading dashboard…" />
      </div>
    );
  }

  const pending = stats.inquiries.filter((i) => (i.status || 'pending') === 'pending').length;
  const cards: { label: string; value: number; sub: string; icon: React.ElementType; target: AdminSectionId }[] = [
    { label: 'Inquiries', value: stats.inquiries.length, sub: `${pending} pending · ${stats.newThisWeek.inquiries} this week`, icon: MessageSquareText, target: 'inquiries' },
    { label: 'Subscribers', value: stats.subscribers, sub: `${stats.newThisWeek.subscribers} new this week`, icon: Mail, target: 'subscriptions' },
    isAdmin
      ? { label: 'Employees', value: stats.fourth, sub: 'Team members with dashboard access', icon: Users, target: 'employees' }
      : { label: 'Places', value: stats.fourth, sub: 'Destinations on the website', icon: MapPin, target: 'places' },
    { label: 'Tour Packages', value: stats.tours, sub: 'Published on the website', icon: Plane, target: 'tours' },
  ];

  const total = stats.inquiries.length || 1;
  const recent = stats.inquiries.slice(0, 6);

  return (
    <div>
      <PanelHeader title={`Welcome back, ${firstName}`} description="Here's what's happening on Exporio Holidays." />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {cards.map((c) => (
          <button
            key={c.label}
            onClick={() => onNavigate(c.target)}
            className="text-left bg-navyBlue border border-slate-800 hover:border-primaryCyan/60 rounded-2xl p-5 transition-colors group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{c.label}</span>
              <span className="w-9 h-9 rounded-xl bg-primaryCyan/15 text-primaryCyan flex items-center justify-center">
                <c.icon className="w-4 h-4" />
              </span>
            </div>
            <div className="text-3xl font-black text-white">{c.value}</div>
            <div className="text-[11px] text-slate-400 mt-1">{c.sub}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-navyBlue border border-slate-800 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
            <h2 className="text-sm font-extrabold text-white">Recent Inquiries</h2>
            <button onClick={() => onNavigate('inquiries')} className="flex items-center gap-1 text-xs font-bold text-primaryCyan hover:underline">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {recent.length === 0 ? (
            <p className="px-5 py-10 text-center text-xs text-slate-400">No inquiries yet.</p>
          ) : (
            <ul className="divide-y divide-slate-800">
              {recent.map((i) => (
                <li key={i.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-white truncate">{i.name}</div>
                    <div className="text-[11px] text-slate-400 truncate">{i.tour_title || 'General Inquiry'} · {i.phone}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-[11px] text-slate-400">{formatDate(i.created_at)}</div>
                    <div className="text-[11px] font-bold capitalize text-slate-300">{i.status || 'pending'}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-navyBlue border border-slate-800 rounded-2xl p-5">
          <h2 className="text-sm font-extrabold text-white mb-4">Inquiries by Status</h2>
          <div className="space-y-3">
            {INQUIRY_STATUSES.map((s) => {
              const count = stats.inquiries.filter((i) => (i.status || 'pending') === s).length;
              return (
                <div key={s}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="capitalize text-slate-300">{s}</span>
                    <span className="font-bold text-white">{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className={`h-full rounded-full ${STATUS_BAR[s]}`} style={{ width: `${(count / total) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
