'use client';

import React, { useEffect, useState } from 'react';
import { X, MailCheck, CheckCircle2 } from 'lucide-react';
import { signInUser, signUpUser, resendVerification, CurrentUser } from '@/lib/userAuth';
import { toast } from '@/lib/toast';

export type AuthView = 'signin' | 'signup' | 'check-email' | 'verified';

const inputClass =
  'w-full bg-slate-800/80 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primaryCyan';
const labelClass = 'block text-xs font-semibold text-slate-300 mb-1';

function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5 text-navyDark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export default function AuthModal({
  initialView = 'signin',
  notice,
  onClose,
  onSignedIn,
}: {
  initialView?: AuthView;
  notice?: string;
  onClose: () => void;
  onSignedIn: (user?: CurrentUser) => void;
}) {
  const [view, setView] = useState<AuthView>(initialView);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);

  // A notice passed in by the Header (e.g. expired verification link) is shown as a side pop-up
  useEffect(() => {
    if (notice) toast.error(notice);
  }, [notice]);

  const switchView = (next: AuthView) => {
    setView(next);
    setNeedsVerification(false);
    setPassword('');
    setConfirmPassword('');
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await signInUser(email, password);
    setLoading(false);
    setNeedsVerification(!!res.notVerified);
    toast.result(res);
    if (res.success) onSignedIn(res.user);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    setLoading(true);
    const res = await signUpUser({ name, email, phone, password });
    setLoading(false);
    toast.result(res);
    if (res.success) setView('check-email');
  };

  const handleResend = async () => {
    setLoading(true);
    const res = await resendVerification(email);
    setLoading(false);
    toast.result(res);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-navyBlue/95 backdrop-blur-md text-white w-full max-w-md max-h-[90vh] overflow-y-auto p-6 rounded-2xl border border-slate-700 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white" aria-label="Close">
          <X className="w-5 h-5" />
        </button>

        {view === 'verified' && (
          <div className="text-center space-y-3 py-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-xl font-bold text-white">Email Verified!</h3>
            <p className="text-sm text-slate-300">Your account is active and you are now signed in.</p>
            <button onClick={onClose} className="mt-2 bg-primaryCyan text-navyDark font-bold px-6 py-2 rounded-lg text-sm hover:brightness-110">
              Start Exploring
            </button>
          </div>
        )}

        {view === 'check-email' && (
          <div className="text-center space-y-3 py-4">
            <MailCheck className="w-12 h-12 text-primaryCyan mx-auto" />
            <h3 className="text-xl font-bold text-white">Verify Your Email</h3>
            <p className="text-sm text-slate-300">
              We sent a verification link to <strong className="text-white">{email}</strong>. Verify your email, then sign in.
            </p>
            <p className="text-xs text-slate-400">Didn&apos;t get it? Check your spam folder or resend the link.</p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
              <button
                onClick={handleResend}
                disabled={loading}
                className="border border-slate-600 text-slate-200 font-semibold px-4 py-2 rounded-lg text-sm hover:border-primaryCyan disabled:opacity-60"
              >
                Resend Email
              </button>
              <button onClick={() => switchView('signin')} className="bg-primaryCyan text-navyDark font-bold px-4 py-2 rounded-lg text-sm hover:brightness-110">
                Go to Sign In
              </button>
            </div>
          </div>
        )}

        {(view === 'signin' || view === 'signup') && (
          <>
            <h3 className="text-xl font-bold text-white mb-1">
              {view === 'signin' ? 'Sign In to Exporio Holidays' : 'Create Your Account'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              {view === 'signin'
                ? 'Enter your credentials to access your account or Admin Dashboard.'
                : 'Sign up to save your details and get exclusive travel deals.'}
            </p>

            {/* Sign In / Sign Up tabs */}
            <div className="grid grid-cols-2 gap-1 bg-slate-800/80 p-1 rounded-lg mb-4">
              {(['signin', 'signup'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => switchView(tab)}
                  className={`py-1.5 rounded-md text-xs font-bold transition-all ${view === tab ? 'bg-primaryCyan text-navyDark' : 'text-slate-400 hover:text-white'}`}
                >
                  {tab === 'signin' ? 'Sign In' : 'Sign Up'}
                </button>
              ))}
            </div>

            {needsVerification && (
              <button
                type="button"
                onClick={handleResend}
                disabled={loading}
                className="w-full mb-4 py-2 rounded-lg border border-primaryCyan/40 text-xs font-bold text-primaryCyan hover:bg-primaryCyan/10 disabled:opacity-60"
              >
                Resend verification email
              </button>
            )}

            <form onSubmit={view === 'signin' ? handleSignIn : handleSignUp} className="space-y-3">
              {view === 'signup' && (
                <div>
                  <label className={labelClass}>Full Name *</label>
                  <input type="text" required maxLength={150} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rahul Sharma" className={inputClass} />
                </div>
              )}

              <div>
                <label className={labelClass}>Email Address *</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className={inputClass} />
              </div>

              {view === 'signup' && (
                <div>
                  <label className={labelClass}>Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    pattern="\+?[\d\s\-]{10,15}"
                    title="Enter a valid mobile number, e.g. +91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className={inputClass}
                  />
                </div>
              )}

              <div>
                <label className={labelClass}>Password *</label>
                <input
                  type="password"
                  required
                  minLength={view === 'signup' ? 8 : undefined}
                  autoComplete={view === 'signup' ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={view === 'signup' ? 'At least 8 characters' : '••••••••'}
                  className={inputClass}
                />
              </div>

              {view === 'signup' && (
                <div>
                  <label className={labelClass}>Confirm Password *</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className={inputClass}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primaryCyan to-blue-600 text-navyDark font-bold py-2.5 rounded-lg text-sm hover:brightness-110 transition-all shadow-glow flex items-center justify-center disabled:opacity-70"
              >
                {loading ? <Spinner /> : view === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <p className="text-xs text-slate-400 text-center mt-4">
              {view === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              <button type="button" onClick={() => switchView(view === 'signin' ? 'signup' : 'signin')} className="text-primaryCyan font-bold hover:underline">
                {view === 'signin' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
