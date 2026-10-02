'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from '@/lib/toast';
import { Phone, Mail, Trash2, RefreshCw } from 'lucide-react';
import Select from '@/components/Select';
import { fetchInquiries, updateInquiryStatus, deleteInquiryRow, InquiryRow, InquiryStatus, INQUIRY_STATUSES } from '@/lib/adminData';
import {
  FilterBar, Pagination, usePagination, PanelHeader, LoadingState, ErrorState, EmptyRow, tableClasses as t,
  formatDate, inDateRange, matchesSearch, uniqueValues, exportCsv,
} from '@/components/admin/ui';

const STATUS_STYLES: Record<InquiryStatus, string> = {
  pending: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
  contacted: 'bg-sky-500/15 text-sky-300 border-sky-500/40',
  confirmed: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
  cancelled: 'bg-red-500/15 text-red-300 border-red-500/40',
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function InquiriesPanel() {
  const [rows, setRows] = useState<InquiryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [tour, setTour] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setRows(await fetchInquiries());
    } catch (err: any) {
      setError(err.message || 'Could not load inquiries.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          matchesSearch(search, r.name, r.email, r.phone, r.tour_title, r.message) &&
          (!status || (r.status || 'pending') === status) &&
          (!tour || (r.tour_title || 'General Inquiry') === tour) &&
          inDateRange(r.created_at, dateFrom, dateTo),
      ),
    [rows, search, status, tour, dateFrom, dateTo],
  );
  const { page, pageCount, pageRows, setPage } = usePagination(filtered);

  const isFiltered = !!(search || status || tour || dateFrom || dateTo);
  const resetFilters = () => {
    setSearch('');
    setStatus('');
    setTour('');
    setDateFrom('');
    setDateTo('');
  };

  const handleStatus = async (row: InquiryRow, next: InquiryStatus) => {
    const previous = row.status;
    setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, status: next } : r)));
    const res = await updateInquiryStatus(row.id, next);
    if (!res.success) {
      setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, status: previous } : r)));
    }
    toast.result(res);
  };

  const handleDelete = async (row: InquiryRow) => {
    if (!confirm(`Delete the inquiry from ${row.name}? This cannot be undone.`)) return;
    const res = await deleteInquiryRow(row.id);
    if (res.success) setRows((rs) => rs.filter((r) => r.id !== row.id));
    toast.result(res);
  };

  const handleExport = () =>
    exportCsv(
      'inquiries',
      [
        { label: 'Received', value: (r: InquiryRow) => formatDate(r.created_at, true) },
        { label: 'Name', value: (r: InquiryRow) => r.name },
        { label: 'Phone', value: (r: InquiryRow) => r.phone },
        { label: 'Email', value: (r: InquiryRow) => r.email },
        { label: 'Package', value: (r: InquiryRow) => r.tour_title || 'General Inquiry' },
        { label: 'Travel Date', value: (r: InquiryRow) => r.travel_date },
        { label: 'Guests', value: (r: InquiryRow) => r.guests_count },
        { label: 'Status', value: (r: InquiryRow) => r.status || 'pending' },
        { label: 'Message', value: (r: InquiryRow) => r.message },
      ],
      filtered,
    );

  return (
    <div>
      <PanelHeader
        title="Inquiries"
        description="Booking and quote requests submitted from the website."
        action={
          <button onClick={load} className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 border border-slate-700 hover:border-primaryCyan px-3 py-2 rounded-lg self-start">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        }
      />

      <FilterBar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search name, phone, email, package or message…"
        selects={[
          { label: 'Statuses', value: status, onChange: setStatus, options: INQUIRY_STATUSES.map((s) => ({ value: s, label: capitalize(s) })) },
          {
            label: 'Packages',
            value: tour,
            onChange: setTour,
            options: uniqueValues(rows.map((r) => r.tour_title || 'General Inquiry')).map((v) => ({ value: v, label: v })),
          },
        ]}
        dateLabel="Received"
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFrom={setDateFrom}
        onDateTo={setDateTo}
        onReset={resetFilters}
        onExport={handleExport}
        resultCount={filtered.length}
        totalCount={rows.length}
      />


      {loading ? (
        <LoadingState label="Loading inquiries…" />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <div className={t.wrapper}>
          <div className="overflow-x-auto">
            <table className={t.table}>
              <thead className={t.thead}>
                <tr>
                  <th className={t.th}>Received</th>
                  <th className={t.th}>Customer</th>
                  <th className={t.th}>Package</th>
                  <th className={t.th}>Travel</th>
                  <th className={t.th}>Message</th>
                  <th className={t.th}>Status</th>
                  <th className={`${t.th} text-right`}>Action</th>
                </tr>
              </thead>
              <tbody className={t.tbody}>
                {pageRows.length === 0 ? (
                  <EmptyRow colSpan={7} filtered={isFiltered} />
                ) : (
                  pageRows.map((r) => {
                    const current = (r.status || 'pending') as InquiryStatus;
                    return (
                      <tr key={r.id} className={t.tr}>
                        <td className={`${t.td} whitespace-nowrap text-slate-300`}>{formatDate(r.created_at, true)}</td>
                        <td className={t.td}>
                          <div className="font-bold text-white">{r.name}</div>
                          <a href={`tel:${r.phone}`} className="flex items-center gap-1.5 text-slate-300 hover:text-primaryCyan mt-1">
                            <Phone className="w-3 h-3 text-emerald-400" /> {r.phone}
                          </a>
                          {r.email && (
                            <a href={`mailto:${r.email}`} className="flex items-center gap-1.5 text-slate-400 hover:text-primaryCyan mt-0.5">
                              <Mail className="w-3 h-3" /> {r.email}
                            </a>
                          )}
                        </td>
                        <td className={`${t.td} font-semibold text-primaryCyan min-w-[160px]`}>{r.tour_title || 'General Inquiry'}</td>
                        <td className={`${t.td} whitespace-nowrap text-slate-300`}>
                          <div>{r.travel_date ? formatDate(r.travel_date) : 'Flexible'}</div>
                          <div className="text-[11px] text-slate-500">{r.guests_count || 2} guests</div>
                        </td>
                        <td className={`${t.td} text-slate-400 max-w-[240px]`}>
                          <p className="line-clamp-3" title={r.message || ''}>{r.message || '—'}</p>
                        </td>
                        <td className={t.td}>
                          <Select
                            ariaLabel={`Status for ${r.name}`}
                            value={current}
                            onChange={(next) => handleStatus(r, next as InquiryStatus)}
                            options={INQUIRY_STATUSES.map((s) => ({ value: s, label: capitalize(s) }))}
                            className={`w-[118px] rounded-full pl-3 pr-8 py-1 text-[11px] font-bold ${STATUS_STYLES[current]}`}
                          />
                        </td>
                        <td className={`${t.td} text-right`}>
                          <button onClick={() => handleDelete(r)} className="p-2 bg-red-500/15 hover:bg-red-600 text-red-300 hover:text-white rounded-lg transition-colors" title="Delete inquiry">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pageCount={pageCount} setPage={setPage} />
        </div>
      )}
    </div>
  );
}
