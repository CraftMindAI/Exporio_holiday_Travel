'use client';

import React, { useEffect, useState } from 'react';
import { UserCog, KeyRound, Eye, EyeOff, SlidersHorizontal, BellRing } from 'lucide-react';
import { updateProfile, changePassword, AdminSession } from '@/lib/adminAuth';
import { fetchSettings, saveSettings, AppSettings } from '@/lib/adminData';
import { toast } from '@/lib/toast';
import { PanelHeader } from '@/components/admin/ui';

const inputClass =
  'w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primaryCyan disabled:opacity-60';
const labelClass = 'block text-xs font-bold text-slate-300 mb-1';

export default function SettingsPanel({ admin, isAdmin, onProfileUpdated }: { admin: AdminSession; isAdmin: boolean; onProfileUpdated: (a: AdminSession) => void }) {
  const [name, setName] = useState(admin.name);
  const [email, setEmail] = useState(admin.email);
  const [emailPassword, setEmailPassword] = useState('');
  const [phone, setPhone] = useState(admin.phone);
  const emailChanged = email.trim().toLowerCase() !== admin.email.toLowerCase();
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [savingSetting, setSavingSetting] = useState(false);

  // Site-wide settings are admin-only
  useEffect(() => {
    if (!isAdmin) return;
    fetchSettings()
      .then(setSettings)
      .catch((err) => toast.error(err.message || 'Could not load settings.'));
  }, [isAdmin]);

  const toggleSetting = async (key: keyof AppSettings) => {
    if (!settings) return;
    const next = !settings[key];
    setSettings({ ...settings, [key]: next });
    setSavingSetting(true);
    const res = await saveSettings({ [key]: next });
    setSavingSetting(false);
    if (res.success && res.settings) setSettings(res.settings);
    else setSettings({ ...settings, [key]: !next });
    toast.result({ success: res.success, message: res.success ? (next ? 'Customer notifications turned on.' : 'Customer notifications turned off.') : res.message });
  };

  const handleProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    const res = await updateProfile({ name, phone, email, currentPassword: emailChanged ? emailPassword : undefined });
    setSavingProfile(false);
    toast.result(res);
    if (res.success && res.user) {
      onProfileUpdated({ ...admin, name: res.user.name, phone: res.user.phone, email: res.user.email });
      setEmail(res.user.email);
      setEmailPassword('');
    }
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    setSavingPassword(true);
    const res = await changePassword(admin.email, currentPassword, newPassword);
    setSavingPassword(false);
    toast.result(res);
    if (res.success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const passwordType = showPasswords ? 'text' : 'password';

  return (
    <div>
      <PanelHeader title="Settings" description={isAdmin ? "Update your profile, password and site settings." : "Update your profile and password."} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <form onSubmit={handleProfile} className="bg-navyBlue border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <UserCog className="w-5 h-5 text-primaryCyan" />
            <h2 className="text-base font-extrabold text-white">Profile</h2>
          </div>

          <div>
            <label className={labelClass}>Email Address *</label>
            <input type="email" required maxLength={150} value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
            <p className="text-[11px] text-slate-500 mt-1">This is the email you sign in with.</p>
          </div>
          {emailChanged && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
              <label className={labelClass}>Current Password *</label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={emailPassword}
                onChange={(e) => setEmailPassword(e.target.value)}
                placeholder="Confirm it's you to change your email"
                className={inputClass}
              />
              <p className="text-[11px] text-amber-200/80 mt-1">After saving, sign in with the new email address.</p>
            </div>
          )}
          <div>
            <label className={labelClass}>Full Name *</label>
            <input type="text" required maxLength={150} value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Mobile Number</label>
            <input
              type="tel"
              pattern="\+?[\d\s\-]{10,15}"
              title="Enter a valid mobile number, e.g. +91 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 9876543210"
              className={inputClass}
            />
          </div>

          <button type="submit" disabled={savingProfile} className="bg-primaryCyan text-navyDark font-extrabold text-xs px-5 py-2.5 rounded-xl hover:brightness-110 disabled:opacity-60">
            {savingProfile ? 'Saving…' : 'Save Profile'}
          </button>
        </form>

        <form onSubmit={handlePassword} className="bg-navyBlue border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-primaryCyan" />
              <h2 className="text-base font-extrabold text-white">Reset Password</h2>
            </div>
            <button type="button" onClick={() => setShowPasswords((v) => !v)} className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white">
              {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showPasswords ? 'Hide' : 'Show'}
            </button>
          </div>

          <div>
            <label className={labelClass}>Current Password *</label>
            <input type={passwordType} required autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>New Password *</label>
            <input
              type={passwordType}
              required
              minLength={8}
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Confirm New Password *</label>
            <input type={passwordType} required minLength={8} autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputClass} />
          </div>

          <button type="submit" disabled={savingPassword} className="bg-primaryCyan text-navyDark font-extrabold text-xs px-5 py-2.5 rounded-xl hover:brightness-110 disabled:opacity-60">
            {savingPassword ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>

      {isAdmin && (
      <section className="bg-navyBlue border border-slate-800 rounded-2xl p-5 sm:p-6 mt-6" aria-labelledby="advanced-settings">
        <div className="flex items-center gap-2 mb-4">
          <SlidersHorizontal className="w-5 h-5 text-primaryCyan" />
          <h2 id="advanced-settings" className="text-base font-extrabold text-white">Advanced Settings</h2>
        </div>

        <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-800 bg-navyDark/40 p-4">
          <div className="flex items-start gap-3">
            <BellRing className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-white">Enable notification to customers</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Email all subscribers automatically when you publish a new tour package. Turn off to publish quietly.
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={!!settings?.customerNotifications}
            aria-label="Enable notification to customers"
            disabled={!settings || savingSetting}
            onClick={() => toggleSetting('customerNotifications')}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
              settings?.customerNotifications ? 'bg-primaryCyan' : 'bg-slate-600'
            }`}
          >
            <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${settings?.customerNotifications ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>

      </section>
      )}
    </div>
  );
}