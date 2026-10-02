'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { adminLogin } from '@/lib/adminAuth';
import { getCurrentUser } from '@/lib/userAuth';
import { toast } from '@/lib/toast';

const inputClass =
  'w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primaryCyan';

/** Admin sign-in. Signed-in admins are sent straight to their dashboard. */
export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    getCurrentUser().then((user) => {
      if (user?.isAdmin && user.adminPath) window.location.replace(user.adminPath);
      else setCheckingSession(false);
    });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await adminLogin(email, password);
    if (res.success && res.redirectTo) {
      window.location.replace(res.redirectTo);
    } else {
      toast.error(res.message);
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primaryCyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-navyDark via-[#1a1a4e] to-[#2d1b4e] flex items-center justify-center p-4">
      <div className="bg-navyBlue text-white w-full max-w-md p-8 rounded-2xl border border-slate-700 shadow-2xl relative">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primaryCyan to-blue-600 flex items-center justify-center mx-auto mb-3 border border-slate-700 shadow-glow">
            <ShieldAlert className="w-8 h-8 text-navyDark" />
          </div>
          <h2 className="text-2xl font-black text-white">Exporio Admin Portal</h2>
          <p className="text-xs text-slate-400 mt-1">Sign in with your admin credentials to access the dashboard.</p>
        </div>


        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Admin Email *</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@exporio.com" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Password *</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={inputClass} />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primaryCyan to-blue-600 hover:brightness-110 text-navyDark font-extrabold py-3 rounded-xl text-xs tracking-wider uppercase shadow-glow transition-all disabled:opacity-70"
          >
            {loading ? 'Signing in...' : 'Access Admin Dashboard'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-xs text-slate-400 hover:text-primaryCyan">
            ← Return to Exporio Holidays Main Site
          </Link>
        </div>
      </div>
    </div>
  );
}
