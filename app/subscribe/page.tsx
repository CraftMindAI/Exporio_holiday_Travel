import { Suspense } from 'react';
import type { Metadata } from 'next';
import SubscribeForm from '@/components/SubscribeForm';

export const metadata: Metadata = {
  title: 'Complete Your Subscription | Exporio Holidays',
  robots: { index: false },
};

export default function SubscribePage() {
  return (
    <div className="py-12 relative min-h-screen bg-gradient-to-br from-navyDark via-navyBlue to-primaryCyan/20 text-white overflow-hidden">
      <div className="max-w-xl mx-auto px-4 relative z-10">
        <div className="text-center mb-8">
          <span className="text-xs font-extrabold uppercase tracking-widest text-primaryCyan bg-primaryCyan/10 px-3 py-1 rounded-full inline-block mb-3 border border-primaryCyan/20">
            Newsletter
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3">
            Complete Your Subscription
          </h1>
          <p className="text-slate-300 text-sm">
            Tell us a little about yourself and we&apos;ll email you whenever we launch a new tour package.
          </p>
        </div>

        <div className="bg-navyDark/60 backdrop-blur-md p-5 sm:p-6 lg:p-8 rounded-2xl border border-slate-700/50 shadow-card">
          {/* useSearchParams needs a Suspense boundary for static export */}
          <Suspense fallback={null}>
            <SubscribeForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
