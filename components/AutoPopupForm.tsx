'use client';

import React, { useState, useEffect } from 'react';
import InquiryModal from './InquiryModal';

export default function AutoPopupForm() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has closed modal in current session
    const hasClosed = sessionStorage.getItem('exporio_popup_closed');
    if (!hasClosed) {
      const timer = setTimeout(() => {
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
