'use client';

import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { TourPackage } from '@/types';
import TourPackageCard from '@/components/TourPackageCard';
import InquiryModal from '@/components/InquiryModal';

const CONTEXT = 'Stranger Trip';

/** "Join a Group Trip" button that opens the enquiry form tagged as a Stranger Trip enquiry. */
export function JoinGroupTripButton({ className = '', label = 'Join a Group Trip' }: { className?: string; label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center justify-center gap-2 bg-primaryCyan text-white font-extrabold text-sm px-6 py-3 rounded-xl shadow-glow hover:brightness-110 transition-all ${className}`}
      >
        <Users className="w-4 h-4" /> {label}
      </button>
      <InquiryModal isOpen={open} onClose={() => setOpen(false)} context={CONTEXT} />
    </>
  );
}

/** Tour cards whose "Enquire" opens the Stranger Trip enquiry form for that tour. */
export function StrangerTripTours({ tours }: { tours: TourPackage[] }) {
  const [selected, setSelected] = useState<TourPackage | null>(null);
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {tours.map((tour) => (
          <TourPackageCard key={tour.id} tour={tour} onEnquire={setSelected} />
        ))}
      </div>
      <InquiryModal tour={selected} isOpen={!!selected} onClose={() => setSelected(null)} context={CONTEXT} />
    </>
  );
}
