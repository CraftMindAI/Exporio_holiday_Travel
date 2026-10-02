'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Send } from 'lucide-react';
import { completeSubscription } from '@/lib/supabase';

const inputClass =
  'w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primaryCyan';

export default function SubscribeForm() {
  const emailFromLink = useSearchParams().get('email')?.trim() ?? '';

  const [name, setName] = useState('');
  const [email, setEmail] = useState(emailFromLink);
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await completeSubscription({ name, email, phone, location });
    setStatus(res);
    setLoading(false);
  };

  if (status?.success) {
    return (
      <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center space-y-3">
        <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
        <h4 className="text-lg font-bold text-emerald-400">Subscription Complete!</h4>
        <p className="text-xs text-emerald-100">{status.message}</p>
        <Link href="/" className="inline-block text-xs text-primaryCyan font-bold hover:underline">
          Explore tour packages
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-slate-300 mb-1">Email Address *</label>
        <input
          type="email"
          required
          value={email}
          readOnly={!!emailFromLink}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          className={`${inputClass} ${emailFromLink ? 'opacity-70 cursor-not-allowed' : ''}`}
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-300 mb-1">Your Full Name *</label>
        <input
          type="text"
          required
          maxLength={150}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Rahul Sharma"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1">Phone Number *</label>
          <input
            type="tel"
            required
            pattern="\+?[\d\s\(\)\-]{7,20}"
            title="Enter a valid phone number, e.g. +91 9876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 9876543210"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1">Location *</label>
          <input
            type="text"
            required
            maxLength={150}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Madurai, Tamil Nadu"
            className={inputClass}
          />
        </div>
      </div>

      {status && !status.success && <p className="text-xs text-red-400">{status.message}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primaryCyan text-navyDark font-extrabold text-sm py-3 rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
      >
        <Send className="w-4 h-4" />
        {loading ? 'Subscribing...' : 'Complete Subscription'}
      </button>
    </form>
  );
}
