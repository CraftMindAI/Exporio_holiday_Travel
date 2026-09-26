'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { siteConfig } from '@/config/siteConfig';

export default function WhatsAppWidget() {
  const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent('Hi Exporio Holidays! I am looking for travel packages & instant quotes.')}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 group flex items-center gap-3"
      title="Chat with Exporio Holidays on WhatsApp"
    >
      {/* Tooltip */}
      <div className="hidden sm:block bg-navyDark/90 backdrop-blur-md text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-xl border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        Need Instant Help? Chat on WhatsApp!
      </div>

      {/* Pulsing Button */}
      <div className="w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-2xl transition-transform duration-300 transform group-hover:scale-110 relative">
        <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
        <MessageCircle className="w-7 h-7 fill-white text-emerald-500 relative z-10" />
      </div>
    </a>
  );
}
