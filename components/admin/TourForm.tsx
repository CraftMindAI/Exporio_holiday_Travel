'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  PlusCircle, Image as ImageIcon, Utensils, MapPin, CalendarDays, BedDouble, X, Sparkles,
} from 'lucide-react';
import { TourPackage, Destination, ItineraryDay } from '@/types';
import { createTour, updateTour, uploadImage } from '@/lib/api';
import { toast } from '@/lib/toast';
import Select from '@/components/Select';
import { TOUR_FACILITIES, TOUR_TYPES, DAY_MEALS, MAX_TOUR_DAYS, DayMeal } from '@/config/tourFacilities';
import { FACILITY_ICONS } from '@/components/tourFacilityIcons';


const inputClass =
  'w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primaryCyan';
const labelClass = 'block text-xs font-bold text-slate-300 mb-1';

type DayDraft = { title: string; description: string; places: string; meals: DayMeal[]; stay: string };
const emptyDay = (): DayDraft => ({ title: '', description: '', places: '', meals: [], stay: '' });

function toDraft(day?: ItineraryDay): DayDraft {
  return day
    ? { title: day.title ?? '', description: day.description ?? '', places: (day.places ?? []).join(', '), meals: (day.meals ?? []) as DayMeal[], stay: day.stay ?? '' }
    : emptyDay();
}

/** Resize the day list to `count`, keeping what was already typed. */
function resizeDays(days: DayDraft[], count: number): DayDraft[] {
  return Array.from({ length: count }, (_, i) => days[i] ?? emptyDay());
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 pt-5 border-t border-slate-800 first:pt-0 first:border-0">
      <div>
        <h4 className="text-sm font-extrabold text-white">{title}</h4>
        {hint && <p className="text-[11px] text-slate-500 mt-0.5">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

export default function TourForm({
  tour,
  destinations,
  onSaved,
  onCancel,
  onAddPlace,
}: {
  /** Tour being edited, or null to create a new one */
  tour: TourPackage | null;
  destinations: Destination[];
  onSaved: () => void;
  onCancel: () => void;
  /** Jump to the Places section (when no place exists yet) */
  onAddPlace: () => void;
}) {
  const editing = !!tour;

  const [title, setTitle] = useState(tour?.title ?? '');
  const [destinationId, setDestinationId] = useState(tour?.destinationId ?? '');
  const [description, setDescription] = useState(tour?.description ?? '');
  const [price, setPrice] = useState(tour ? String(tour.price) : '');
  const [originalPrice, setOriginalPrice] = useState(tour?.originalPrice ? String(tour.originalPrice) : '');
  const [days, setDays] = useState(tour?.durationDays ?? 5);
  const [imageUrl, setImageUrl] = useState(tour?.imageUrl ?? '');
  const [facilities, setFacilities] = useState<string[]>(tour?.facilities?.length ? tour.facilities : ['hotel', 'meals', 'transport', 'sightseeing']);
  const [highlights, setHighlights] = useState<string[]>(tour?.highlights?.length ? tour.highlights : ['']);
  const [itinerary, setItinerary] = useState<DayDraft[]>(() => resizeDays((tour?.itinerary ?? []).map(toDraft), tour?.durationDays ?? 5));
  const [isFeatured, setIsFeatured] = useState(tour?.isFeatured ?? true);
  const [isTrending, setIsTrending] = useState(tour?.isTrending ?? true);
  const [showPrice, setShowPrice] = useState(tour?.showPrice ?? true);
  const [tourTypes, setTourTypes] = useState<string[]>(tour?.tourTypes ?? []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const nights = Math.max(0, days - 1);
  const destination = destinations.find((d) => d.id === destinationId);
  const destinationOptions = useMemo(
    () =>
      destinations.map((d) => ({
        value: d.id,
        label: `${d.name} — ${d.category === 'international' ? `International${d.country ? ` · ${d.country}` : ''}` : 'Domestic'}`,
      })),
    [destinations],
  );

  // Keep one itinerary card per day
  useEffect(() => {
    setItinerary((current) => resizeDays(current, days));
  }, [days]);

  const updateDay = (index: number, patch: Partial<DayDraft>) =>
    setItinerary((current) => current.map((d, i) => (i === index ? { ...d, ...patch } : d)));

  const toggleFacility = (key: string) =>
    setFacilities((current) => (current.includes(key) ? current.filter((f) => f !== key) : [...current, key]));

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      setImageUrl(await uploadImage(file, 'tour'));
      toast.success('Image uploaded successfully!');
    } catch (err: any) {
      toast.error(`Error uploading image: ${err.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destinationId) return toast.error('Please select the location / destination.');
    if (!imageUrl) return toast.error('Please upload a cover image or paste an image URL.');

    const payload = {
      title,
      destinationId,
      description,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      showPrice,
      durationDays: days,
      imageUrl,
      facilities,
      tourTypes,
      highlights: highlights.map((h) => h.trim()).filter(Boolean),
      itinerary: itinerary.map((d, i) => ({
        day: i + 1,
        title: d.title.trim(),
        description: d.description.trim(),
        places: d.places.split(',').map((p) => p.trim()).filter(Boolean),
        meals: d.meals,
        stay: d.stay.trim(),
      })),
      isFeatured,
      isTrending,
    };

    setSaving(true);
    const res = editing ? await updateTour(tour!.id, payload) : await createTour(payload);
    setSaving(false);
    toast.result(res);
    if (res.success) onSaved();
  };

  return (
    <div className="bg-navyBlue border border-slate-800 rounded-2xl p-5 sm:p-8 w-full max-w-4xl mx-auto shadow-2xl">
      <div className="flex items-start justify-between gap-3 mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-primaryCyan" /> {editing ? 'Edit Tour Package' : 'Create New Tour Package'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {editing ? 'Update the details for this tour package.' : 'Fill in the tour details below to publish a new package to your website.'}
          </p>
        </div>
        {editing && (
          <button type="button" onClick={onCancel} className="text-xs text-slate-400 hover:text-white underline flex-shrink-0">
            Cancel Edit
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ---------------- Details ---------------- */}
        <Section title="Package details">
          <div>
            <label className={labelClass}>Package Title *</label>
            <input type="text" required maxLength={255} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Exotic Sikkim & Gangtok Wonderland" className={inputClass} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 items-end">
            <div>
              <label className={labelClass}>Location / Destination *</label>
              {destinations.length ? (
                <Select
                  ariaLabel="Location / Destination"
                  value={destinationId}
                  onChange={setDestinationId}
                  options={destinationOptions}
                  placeholder="Select a place"
                  searchable
                  maxVisible={5}
                />
              ) : (
                <div className="text-xs text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3.5 py-2.5">
                  No places yet.{' '}
                  <button type="button" onClick={onAddPlace} className="font-bold underline">
                    Add a place first
                  </button>
                </div>
              )}
            </div>
            <div>
              <span className={labelClass}>Category</span>
              <span className="inline-flex items-center gap-1.5 h-[38px] px-3.5 rounded-xl border border-slate-700 bg-slate-900/60 text-xs font-semibold text-slate-300 capitalize min-w-[140px]">
                <MapPin className="w-3.5 h-3.5 text-primaryCyan" />
                {destination ? `${destination.category}${destination.country ? ` · ${destination.country}` : ''}` : '—'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className={labelClass}>Offer Price (₹) *</label>
              <input type="number" required min={0} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="14999" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Original Price (₹)</label>
              <input type="number" min={0} value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} placeholder="19999" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Number of Days *</label>
              <input
                type="number"
                required
                min={1}
                max={MAX_TOUR_DAYS}
                value={days}
                onChange={(e) => setDays(Math.min(MAX_TOUR_DAYS, Math.max(1, Number(e.target.value) || 1)))}
                className={inputClass}
              />
            </div>
            <div>
              <span className={labelClass}>Number of Nights</span>
              <span className="flex items-center h-[38px] px-3.5 rounded-xl border border-slate-700 bg-slate-900/60 text-xs font-semibold text-slate-300" aria-live="polite">
                {nights} {nights === 1 ? 'Night' : 'Nights'} <span className="text-slate-500 font-normal ml-1">(auto)</span>
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="tour-cover" className={labelClass}>
              Cover Image * <span className="font-normal text-slate-500">(upload or paste a URL)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-3 items-stretch">
              <label
                htmlFor="tour-cover"
                className={`relative flex flex-col items-center justify-center gap-1.5 min-h-[120px] rounded-xl border-2 border-dashed overflow-hidden cursor-pointer ${
                  imageUrl ? 'border-slate-700' : 'border-slate-600 hover:border-primaryCyan bg-slate-900/60'
                } ${uploading ? 'opacity-70 cursor-wait' : ''}`}
              >
                {imageUrl ? (
                  <>
                    <img src={imageUrl} alt="Cover preview" className="absolute inset-0 w-full h-full object-cover" />
                    <span className="relative mt-auto mb-2 bg-navyDark/80 text-white text-[10px] font-semibold px-2.5 py-1 rounded-lg">
                      {uploading ? 'Uploading…' : 'Click to replace'}
                    </span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-6 h-6 text-slate-400" />
                    <span className="text-[11px] font-semibold text-slate-300">{uploading ? 'Uploading…' : 'Upload image'}</span>
                  </>
                )}
                <input id="tour-cover" type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" onChange={handleUpload} disabled={uploading} className="sr-only" />
              </label>
              <div className="flex flex-col justify-center gap-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">or paste image URL</span>
                <input
                  type="url"
                  aria-label="Cover image URL"
                  value={imageUrl.startsWith('/media/') ? '' : imageUrl}
                  onChange={(e) => setImageUrl(e.target.value.trim())}
                  placeholder="https://images.unsplash.com/..."
                  className={inputClass}
                />
                <div className="flex flex-wrap gap-4 pt-1">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer" title="When unticked, the website shows 'Price on request' instead of the price">
                    <input type="checkbox" checked={showPrice} onChange={(e) => setShowPrice(e.target.checked)} className="accent-[#ff4e00] w-4 h-4" />
                    Show price on website
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="accent-[#ff4e00] w-4 h-4" />
                    Featured
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={isTrending} onChange={(e) => setIsTrending(e.target.checked)} className="accent-[#ff4e00] w-4 h-4" />
                    Trending
                  </label>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* ---------------- Description ---------------- */}
        <Section title="Description" hint="A detailed overview of the package shown on the tour page.">
          <textarea
            rows={6}
            maxLength={20000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the experience, what makes this package special, who it suits, etc."
            className={`${inputClass} resize-y`}
            aria-label="Description"
          />
        </Section>

        {/* ---------------- Tour includes ---------------- */}
        <Section title="Tour Includes" hint="Facilities provided in this package.">
          <div className="flex flex-wrap gap-2.5">
            {TOUR_FACILITIES.map((f) => {
              const Icon = FACILITY_ICONS[f.key];
              const on = facilities.includes(f.key);
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => toggleFacility(f.key)}
                  aria-pressed={on}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-colors ${
                    on ? 'bg-primaryCyan/15 border-primaryCyan text-white' : 'border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${on ? 'text-primaryCyan' : ''}`} /> {f.label}
                </button>
              );
            })}
          </div>
        </Section>

        {/* ---------------- Tour type ---------------- */}
        <Section title="Tour Type" hint="Tick every type this package suits. Customers use these in the Tour Type filter on location pages.">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5" role="group" aria-label="Tour type">
            {TOUR_TYPES.map((t) => {
              const on = tourTypes.includes(t.key);
              return (
                <label
                  key={t.key}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
                    on ? 'bg-primaryCyan/15 border-primaryCyan text-white' : 'border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <input
                    type="checkbox"
                    value={t.key}
                    checked={on}
                    onChange={(e) => setTourTypes((current) => (e.target.checked ? [...current, t.key] : current.filter((x) => x !== t.key)))}
                    className="w-4 h-4 accent-[#ff4e00] cursor-pointer"
                  />
                  {t.label}
                </label>
              );
            })}
          </div>
        </Section>

        {/* ---------------- Highlights ---------------- */}
        <Section title="Tour Highlights" hint="Key selling points, one per line.">
          <div className="space-y-2">
            {highlights.map((h, i) => (
              <div key={i} className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primaryCyan flex-shrink-0" />
                <input
                  type="text"
                  maxLength={300}
                  value={h}
                  onChange={(e) => setHighlights((current) => current.map((x, j) => (j === i ? e.target.value : x)))}
                  placeholder={`Highlight ${i + 1}, e.g. Tsomgo Lake & Baba Mandir`}
                  aria-label={`Highlight ${i + 1}`}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setHighlights((current) => (current.length > 1 ? current.filter((_, j) => j !== i) : ['']))}
                  className="p-2 text-slate-500 hover:text-red-400"
                  aria-label={`Remove highlight ${i + 1}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {highlights.length < 30 && (
              <button type="button" onClick={() => setHighlights((current) => [...current, ''])} className="flex items-center gap-1.5 text-xs font-bold text-primaryCyan hover:underline">
                <PlusCircle className="w-4 h-4" /> Add highlight
              </button>
            )}
          </div>
        </Section>

        {/* ---------------- Itinerary ---------------- */}
        <Section title="Day-wise Itinerary" hint={`${days} ${days === 1 ? 'day' : 'days'} — one card per day. Change "Number of Days" to add or remove days.`}>
          <ol className="space-y-3">
            {itinerary.map((d, i) => (
              <li key={i} className="rounded-xl border border-slate-700 bg-navyDark/40 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-xs font-extrabold text-primaryCyan uppercase tracking-wider">
                    <CalendarDays className="w-4 h-4" /> Day {i + 1}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    maxLength={200}
                    value={d.title}
                    onChange={(e) => updateDay(i, { title: e.target.value })}
                    placeholder={i === 0 ? 'Title, e.g. Arrival Day' : i === days - 1 ? 'Title, e.g. Departure' : 'Title, e.g. Trip to Lachung'}
                    aria-label={`Day ${i + 1} title`}
                    className={inputClass}
                  />
                  <input
                    type="text"
                    value={d.places}
                    onChange={(e) => updateDay(i, { places: e.target.value })}
                    placeholder="Places to visit (comma separated)"
                    aria-label={`Day ${i + 1} places to visit`}
                    className={inputClass}
                  />
                </div>
                <textarea
                  rows={2}
                  maxLength={5000}
                  value={d.description}
                  onChange={(e) => updateDay(i, { description: e.target.value })}
                  placeholder="What happens this day"
                  aria-label={`Day ${i + 1} description`}
                  className={`${inputClass} resize-y`}
                />
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-3 flex-wrap" role="group" aria-label={`Day ${i + 1} meals`}>
                    <Utensils className="w-4 h-4 text-slate-400" />
                    {DAY_MEALS.map((m) => (
                      <label key={m} className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={d.meals.includes(m)}
                          onChange={(e) => updateDay(i, { meals: e.target.checked ? [...d.meals, m] : d.meals.filter((x) => x !== m) })}
                          className="accent-[#ff4e00] w-3.5 h-3.5"
                        />
                        {m}
                      </label>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    <BedDouble className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <input
                      type="text"
                      maxLength={200}
                      value={d.stay}
                      onChange={(e) => updateDay(i, { stay: e.target.value })}
                      placeholder={i === days - 1 ? 'Stay (none on departure day)' : 'Stay, e.g. Hotel in Gangtok'}
                      aria-label={`Day ${i + 1} stay`}
                      className={inputClass}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        <button
          type="submit"
          disabled={saving || uploading}
          className="w-full bg-gradient-to-r from-primaryCyan to-blue-600 hover:brightness-110 text-navyDark font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider shadow-glow transition-all disabled:opacity-50"
        >
          {saving ? 'Saving Tour...' : editing ? 'Update Tour Package' : 'Publish Tour Package'}
        </button>
      </form>
    </div>
  );
}

