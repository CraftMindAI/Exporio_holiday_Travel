'use client';

import React, { useState, useEffect } from 'react';
import InquiryModal from './InquiryModal';
import { hasSubmittedInquiry } from '@/lib/inquiryStatus';

export default function AutoPopupForm() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has closed modal in current session
    const hasClosed = sessionStorage.getItem('exporio_popup_closed');
    if (!hasClosed && !hasSubmittedInquiry()) {
      const timer = setTimeout(() => {
        // Skip if the visitor already opened an enquiry form themselves
        if (document.querySelector('[data-inquiry-modal]')) return;
        setIsOpen(true);
      }, 10000); // 10 seconds timer
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('exporio_popup_closed', 'true');
  };

  return <InquiryModal isOpen={isOpen} onClose={handleClose} />;
}
