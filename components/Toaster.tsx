'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { dismissToast, subscribeToasts, ToastItem } from '@/lib/toast';

const STYLES = {
  success: { icon: CheckCircle2, bar: 'bg-emerald-400', iconColor: 'text-emerald-400' },
  error: { icon: XCircle, bar: 'bg-red-400', iconColor: 'text-red-400' },
  info: { icon: Info, bar: 'bg-sky-400', iconColor: 'text-sky-400' },
};

/** Side pop-up notifications for every form on the site and dashboard (see lib/toast.ts). */
export default function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);
  useEffect(() => subscribeToasts(setItems), []);

  return (
    <div
      className="fixed z-[200] top-3 inset-x-3 sm:inset-x-auto sm:top-5 sm:right-5 sm:w-[360px] flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
    >
      {items.map((t) => {
        const s = STYLES[t.type];
        return (
          <div
            key={t.id}
            role={t.type === 'error' ? 'alert' : 'status'}
            className="toast-in pointer-events-auto relative overflow-hidden flex items-start gap-3 bg-navyDark/95 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl pl-4 pr-10 py-3"
          >
            <span className={`absolute left-0 top-0 bottom-0 w-1 ${s.bar}`} />
            <s.icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${s.iconColor}`} />
            <span className="text-sm text-slate-100 leading-snug">{t.message}</span>
            <button
              type="button"
              onClick={() => dismissToast(t.id)}
              className="absolute top-2.5 right-2.5 p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
