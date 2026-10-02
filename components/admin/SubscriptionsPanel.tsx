'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from '@/lib/toast';
import { Mail, Phone, Trash2, RefreshCw } from 'lucide-react';
import { fetchSubscribers, deleteSubscriber, SubscriberRow } from '@/lib/adminData';
import {
  FilterBar, Pagination, usePagination, PanelHeader, LoadingState, ErrorState, EmptyRow, tableClasses as t,
  formatDate, inDateRange, matchesSearch, uniqueValues, exportCsv,
} from '@/components/admin/ui';

/** A subscriber who filled in the /subscribe form (vs. legacy email-only rows). */
const isComplete = (r: SubscriberRow) => !!(r.name && r.phone);

export default function SubscriptionsPanel() {
  const [rows, setRows] = useState<SubscriberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [profile, setProfile] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setRows(await fetchSubscribers());
    } catch (err: any) {
      setError(err.message || 'Could not load subscribers.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const locations = uniqueValues(rows.map((r) => r.location));

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          matchesSearch(search, r.email, r.name, r.phone, r.location) &&
          (!location || r.location === location) &&
          (!profile || (profile === 'complete' ? isComplete(r) : !isComplete(r))) &&
          inDateRange(r.subscribed_at, dateFrom, dateTo),
      ),
    [rows, search, location, profile, dateFrom, dateTo],
  );
  const { page, pageCount, pageRows, setPage } = usePagination(filtered);

  const isFiltered = !!(search || location || profile || dateFrom || dateTo);
  const resetFilters = () => {
    setSearch('');
    setLocation('');
    setProfile('');
    setDateFrom('');
    setDateTo('');
  };

  const handleDelete = async (row: SubscriberRow) => {
    if (!confirm(`Remove ${row.email} from subscribers? They will stop receiving new package emails.`)) return;
    const res = await deleteSubscriber(row.id);
    if (res.success) setRows((rs) => rs.filter((r) => r.id !== row.id));
    toast.result(res);
  };

  const handleExport = () =>
    exportCsv(
      'subscribers',
      [
        { label: 'Email', value: (r: SubscriberRow) => r.email },
        { label: 'Name', value: (r: SubscriberRow) => r.name },
        { label: 'Mobile', value: (r: SubscriberRow) => r.phone },
        { label: 'Location', value: (r: SubscriberRow) => r.location },
        { label: 'Subscribed', value: (r: SubscriberRow) => formatDate(r.subscribed_at, true) },
      ],
      filtered,
    );

  return (
    <div>
      <PanelHeader
        title="Subscriptions"
        description="People who subscribed to new tour package alerts. All of them are emailed when you publish a new package."
        action={
          <button onClick={load} className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 border border-slate-700 hover:border-primaryCyan px-3 py-2 rounded-lg self-start">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        }
      />

      <FilterBar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search email, name, mobile or location…"
        selects={[
          ...(locations.length ? [{ label: 'Locations', value: location, onChange: setLocation, options: locations.map((v) => ({ value: v, label: v })) }] : []),
          {
            label: 'Profiles',
            value: profile,
            onChange: setProfile,
            options: [
              { value: 'complete', label: 'Form completed' },
              { value: 'email-only', label: 'Email only' },
            ],
          },
        ]}
        dateLabel="Subscribed"
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
        <LoadingState label="Loading subscribers…" />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <div className={t.wrapper}>
          <div className="overflow-x-auto">
            <table className={t.table}>
              <thead className={t.thead}>
                <tr>
                  <th className={t.th}>Subscriber</th>
                  <th className={t.th}>Mobile</th>
                  <th className={t.th}>Location</th>
                  <th className={t.th}>Subscribed</th>
                  <th className={`${t.th} text-right`}>Action</th>
                </tr>
              </thead>
              <tbody className={t.tbody}>
                {pageRows.length === 0 ? (
                  <EmptyRow colSpan={5} filtered={isFiltered} />
                ) : (
                  pageRows.map((r) => (
                    <tr key={r.id} className={t.tr}>
                      <td className={t.td}>
                        <div className="font-bold text-white">{r.name || <span className="text-slate-500 font-normal italic">No name yet</span>}</div>
                        <a href={`mailto:${r.email}`} className="flex items-center gap-1.5 text-slate-400 hover:text-primaryCyan mt-0.5">
                          <Mail className="w-3 h-3" /> {r.email}
                        </a>
                      </td>
                      <td className={`${t.td} whitespace-nowrap`}>
                        {r.phone ? (
                          <a href={`tel:${r.phone}`} className="flex items-center gap-1.5 text-slate-300 hover:text-primaryCyan">
                            <Phone className="w-3 h-3 text-emerald-400" /> {r.phone}
                          </a>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className={`${t.td} text-slate-300`}>{r.location || '—'}</td>
                      <td className={`${t.td} whitespace-nowrap text-slate-300`}>{formatDate(r.subscribed_at, true)}</td>
                      <td className={`${t.td} text-right`}>
                        <button onClick={() => handleDelete(r)} className="p-2 bg-red-500/15 hover:bg-red-600 text-red-300 hover:text-white rounded-lg transition-colors" title="Remove subscriber">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
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
