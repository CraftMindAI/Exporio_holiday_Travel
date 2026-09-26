'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, ShieldCheck, Send } from 'lucide-react';
import { submitInquiry } from '@/lib/supabase';

export default function AutoPopupForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [peopleCount, setPeopleCount] = useState('');
  const [nightsCount, setNightsCount] = useState('');
  const [arrivalDate, setArrivalDate] = useState('');
  const [destination, setDestination] = useState('');
  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaChecked) {
      alert('Please confirm you are not a robot by clicking the reCAPTCHA box.');
      return;
    }
    setLoading(true);

    try {
      await submitInquiry({
        name,
        email,
        phone,
        guestsCount: parseInt(peopleCount) || 2,
        travelDate: arrivalDate,
        tourTitle: `${destination || 'General'} Tour (${nightsCount || 'Custom'} Nights)`,
        message: `Destination: ${destination}, Nights: ${nightsCount}`,
      });
      setSubmitted(true);
      setTimeout(() => {
        handleClose();
      }, 3000);
    } catch (err) {
      alert('Error submitting inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-300">
      <div className="bg-white text-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative border border-slate-200 animate-in zoom-in-95 duration-300">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/50 hover:bg-black text-white flex items-center justify-center transition-all shadow-md"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Cultural Travelers Banner */}
        <div className="relative h-44 sm:h-52 overflow-hidden bg-slate-900">
          <img
            src="https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1000&q=80"
            alt="Travelers Banner"
            className="w-full h-full object-cover object-center scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />
          <div className="absolute bottom-4 left-5 right-5 text-white">
            <span className="text-[11px] font-bold uppercase tracking-widest text-primaryCyan bg-navyBlue/80 px-2.5 py-1 rounded-md border border-slate-700">
              Get Custom Travel Quote
            </span>
            <h3 className="text-xl sm:text-2xl font-black mt-1 leading-tight text-white drop-shadow-md">
              Plan Your Dream Vacation Today!
            </h3>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-5 sm:p-6">
          {submitted ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-extrabold text-navyBlue">Details Sent Successfully!</h4>
              <p className="text-xs text-slate-600">
                Our travel representative will contact you within 10 minutes with custom quotes & itineraries.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Row 1: Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Id"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              {/* Row 2: Contact Number & No. of People */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Contact Number"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
                <input
                  type="number"
                  min="1"
                  required
                  value={peopleCount}
                  onChange={(e) => setPeopleCount(e.target.value)}
                  placeholder="No. of People"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              {/* Row 3: Select no. of nights & Date of Arrival */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select
                  required
                  value={nightsCount}
                  onChange={(e) => setNightsCount(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Select no. of nights</option>
                  <option value="2 Nights / 3 Days">2 Nights / 3 Days</option>
                  <option value="3 Nights / 4 Days">3 Nights / 4 Days</option>
                  <option value="4 Nights / 5 Days">4 Nights / 5 Days</option>
                  <option value="5 Nights / 6 Days">5 Nights / 6 Days</option>
                  <option value="6+ Nights">6+ Nights</option>
                </select>

                <div className="relative">
                  <input
                    type="date"
                    required
                    value={arrivalDate}
                    onChange={(e) => setArrivalDate(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-cyan-500"
                  />
                  {!arrivalDate && (
                    <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 pointer-events-none">
                      Date of Arrival
                    </span>
                  )}
                </div>
              </div>

              {/* Row 4: Select Your Destination */}
              <div>
                <select
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Select Your Destination</option>
                  <option value="Sikkim & Gangtok">Sikkim & Gangtok</option>
                  <option value="Kashmir">Kashmir</option>
                  <option value="Darjeeling">Darjeeling</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Andaman Islands">Andaman Islands</option>
                  <option value="Bhutan">Bhutan</option>
                  <option value="Bali">Bali</option>
                  <option value="Shimla & Manali">Shimla & Manali</option>
                  <option value="Leh Ladakh">Leh Ladakh</option>
                  <option value="Goa">Goa</option>
                  <option value="Uttarakhand">Uttarakhand</option>
                </select>
              </div>

              {/* Row 5: reCAPTCHA Widget Simulation */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between my-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={captchaChecked}
                    onChange={(e) => setCaptchaChecked(e.target.checked)}
                    className="w-5 h-5 rounded text-cyan-500 border-slate-300 focus:ring-cyan-500 cursor-pointer"
                  />
                  <span className="text-xs font-medium text-slate-700">I'm not a robot</span>
                </label>

                <div className="flex flex-col items-center">
                  <ShieldCheck className="w-5 h-5 text-blue-500" />
                  <span className="text-[9px] text-slate-400 font-semibold uppercase">reCAPTCHA</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#00F2FE] hover:bg-[#00d8e4] text-slate-900 font-extrabold py-3 rounded-lg text-xs tracking-wider uppercase shadow-md transition-all flex items-center justify-center gap-2 mt-2"
              >
                {loading ? 'Sending Request...' : 'Send Me Details'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
