'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Search, RotateCcw, Download, ChevronLeft, ChevronRight, Inbox, Trash2 } from 'lucide-react';
import Select from '@/components/Select';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

export function formatDate(value?: string | null, withTime = false): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  });
}

/** True when `value` (ISO date/timestamp) falls within the inclusive yyyy-mm-dd range. */
export function inDateRange(value: string | null | undefined, from: string, to: string): boolean {
  if (!from && !to) return true;
  if (!value) return false;
  const day = value.slice(0, 10);
  return (!from || day >= from) && (!to || day <= to);
}

/** Case-insensitive match of `query` against any of the given fields. */
export function matchesSearch(query: string, ...fields: (string | number | null | undefined)[]): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return fields.some((f) => f != null && String(f).toLowerCase().includes(q));
}

export function uniqueValues(values: (string | null | undefined)[]): string[] {
  return Array.from(new Set(values.filter((v): v is string => !!v && v.trim() !== ''))).sort((a, b) => a.localeCompare(b));
}

/** Download rows as a CSV file. */
export function exportCsv(filename: string, columns: { label: string; value: (row: any) => unknown }[], rows: any[]) {
  const escape = (v: unknown) => {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [columns.map((c) => escape(c.label)).join(','), ...rows.map((r) => columns.map((c) => escape(c.value(r))).join(','))].join('\n');
  const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ------------------------------------------------------------------ */
/* Filter bar                                                          */
/* ------------------------------------------------------------------ */

export type SelectFilter = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
};

const controlClass =
  'bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primaryCyan [color-scheme:dark]';

export function FilterBar({
  search,
  onSearch,
  searchPlaceholder,
  selects = [],
  dateLabel = 'Date',
  dateFrom,
  dateTo,
  onDateFrom,
  onDateTo,
  onReset,
  onExport,
  resultCount,
  totalCount,
}: {
  search: string;
  onSearch: (value: string) => void;
  searchPlaceholder: string;
  selects?: SelectFilter[];
  dateLabel?: string;
  dateFrom: string;
  dateTo: string;
  onDateFrom: (value: string) => void;
  onDateTo: (value: string) => void;
  onReset: () => void;
  onExport?: () => void;
  resultCount: number;
  totalCount: number;
}) {
  return (
    <div className="bg-navyBlue border border-slate-800 rounded-2xl p-4 mb-4 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        <label className="relative xl:col-span-2">
          <span className="sr-only">Search</span>
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className={`${controlClass} w-full pl-9`}
          />
        </label>

        {selects.map((s) => (
          <Select
            key={s.label}
            ariaLabel={s.label}
            value={s.value}
            onChange={s.onChange}
            options={[{ value: '', label: `All ${s.label}` }, ...s.options]}
            className="rounded-lg py-2 pl-3"
          />
        ))}
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center gap-3 justify-between">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span className="font-semibold">{dateLabel}:</span>
          <input type="date" value={dateFrom} max={dateTo || undefined} onChange={(e) => onDateFrom(e.target.value)} className={controlClass} aria-label={`${dateLabel} from`} />
          <span>to</span>
          <input type="date" value={dateTo} min={dateFrom || undefined} onChange={(e) => onDateTo(e.target.value)} className={controlClass} aria-label={`${dateLabel} to`} />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 mr-1">
            Showing <strong className="text-white">{resultCount}</strong> of {totalCount}
          </span>
          <button onClick={onReset} className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 border border-slate-700 hover:border-primaryCyan px-3 py-2 rounded-lg">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          {onExport && (
            <button
              onClick={onExport}
              disabled={resultCount === 0}
              className="flex items-center gap-1.5 text-xs font-bold bg-primaryCyan text-navyDark px-3 py-2 rounded-lg hover:brightness-110 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Pagination                                                          */
/* ------------------------------------------------------------------ */

export function usePagination<T>(rows: T[], pageSize = 15) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));

  // Jump back to page 1 whenever the filtered result set changes size
  useEffect(() => setPage(1), [rows.length]);

  const pageRows = useMemo(() => rows.slice((page - 1) * pageSize, page * pageSize), [rows, page, pageSize]);
  return { page: Math.min(page, pageCount), pageCount, pageRows, setPage };
}

export function Pagination({ page, pageCount, setPage }: { page: number; pageCount: number; setPage: (p: number) => void }) {
  if (pageCount <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800 text-xs text-slate-400">
      <span>
        Page {page} of {pageCount}
      </span>
      <div className="flex gap-2">
        <button onClick={() => setPage(page - 1)} disabled={page <= 1} className="p-1.5 rounded-lg border border-slate-700 hover:border-primaryCyan disabled:opacity-40" aria-label="Previous page">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button onClick={() => setPage(page + 1)} disabled={page >= pageCount} className="p-1.5 rounded-lg border border-slate-700 hover:border-primaryCyan disabled:opacity-40" aria-label="Next page">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* States & layout bits                                                */
/* ------------------------------------------------------------------ */

/** Modal confirmation for destructive actions. */
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel = 'Delete',
  busy = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  confirmLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !busy && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, busy, onCancel]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !busy && onCancel()} />
      <div className="relative w-full max-w-sm bg-navyBlue border border-slate-700 rounded-2xl p-6 shadow-2xl">
        <div className="w-12 h-12 rounded-full bg-red-500/15 text-red-400 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6" />
        </div>
        <h2 id="confirm-title" className="text-lg font-extrabold text-white text-center mb-2">{title}</h2>
        <div className="text-sm text-slate-300 text-center mb-6">{children}</div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={onCancel} disabled={busy} className="py-2.5 rounded-xl text-sm font-bold border border-slate-600 text-slate-200 hover:border-slate-400 disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={busy} className="py-2.5 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-500 text-white disabled:opacity-60">
            {busy ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function PanelHeader({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white">{title}</h1>
        <p className="text-xs text-slate-400 mt-1">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function LoadingState({ label }: { label: string }) {
  return (
    <div className="text-center py-20">
      <div className="w-8 h-8 border-4 border-primaryCyan border-t-transparent rounded-full animate-spin mx-auto mb-3" />
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="bg-red-500/10 border border-red-500/40 rounded-2xl p-6 text-center">
      <p className="text-sm text-red-300 mb-3">{message}</p>
      <button onClick={onRetry} className="text-xs font-bold bg-red-500/20 hover:bg-red-500/40 text-red-200 px-4 py-2 rounded-lg">
        Try again
      </button>
    </div>
  );
}

export function EmptyRow({ colSpan, filtered }: { colSpan: number; filtered: boolean }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-14 text-center text-slate-400">
        <Inbox className="w-10 h-10 text-slate-600 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-300">{filtered ? 'No results match your filters' : 'Nothing here yet'}</p>
        {filtered && <p className="text-xs mt-1">Try changing or resetting the filters.</p>}
      </td>
    </tr>
  );
}

export const tableClasses = {
  wrapper: 'bg-navyBlue border border-slate-800 rounded-2xl overflow-hidden shadow-2xl',
  table: 'w-full text-left text-xs',
  thead: 'bg-navyDark text-slate-400 uppercase text-[11px] tracking-wider border-b border-slate-800',
  th: 'px-4 py-3.5 whitespace-nowrap',
  tbody: 'divide-y divide-slate-800',
  tr: 'hover:bg-slate-800/50 transition-colors align-top',
  td: 'px-4 py-3.5',
};
