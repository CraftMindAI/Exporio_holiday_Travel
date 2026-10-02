'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from '@/lib/toast';
import { Mail, Phone, RefreshCw, Trash2 } from 'lucide-react';
import { fetchClients, deleteClient, ClientRow } from '@/lib/adminData';
import {
  FilterBar, Pagination, usePagination, PanelHeader, LoadingState, ErrorState, EmptyRow, tableClasses as t,
  formatDate, inDateRange, matchesSearch, exportCsv, ConfirmDialog,
} from '@/components/admin/ui';

export default function UsersPanel() {
  const [rows, setRows] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toDelete, setToDelete] = useState<ClientRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState('');
  const [mobile, setMobile] = useState('');
  const [verified, setVerified] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setRows(await fetchClients());
    } catch (err: any) {
      setError(err.message || 'Could not load users.');
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
          matchesSearch(search, r.name, r.email, r.phone) &&
          (!mobile || (mobile === 'with' ? !!r.phone : !r.phone)) &&
          (!verified || (verified === 'yes') === r.email_verified) &&
          inDateRange(r.created_at, dateFrom, dateTo),
      ),
    [rows, search, mobile, verified, dateFrom, dateTo],
  );
  const { page, pageCount, pageRows, setPage } = usePagination(filtered);

  const isFiltered = !!(search || mobile || verified || dateFrom || dateTo);
  const resetFilters = () => {
    setSearch('');
    setMobile('');
    setVerified('');
    setDateFrom('');
    setDateTo('');
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    const res = await deleteClient(toDelete.id);
    setDeleting(false);
    if (res.success) setRows((rs) => rs.filter((r) => r.id !== toDelete.id));
    setToDelete(null);
    toast.result(res);
  };

  const handleExport = () =>
    exportCsv(
      'users',
      [
        { label: 'Name', value: (r: ClientRow) => r.name },
        { label: 'Email', value: (r: ClientRow) => r.email },
        { label: 'Mobile', value: (r: ClientRow) => r.phone },
        { label: 'Email Verified', value: (r: ClientRow) => (r.email_verified ? 'Yes' : 'No') },
        { label: 'Joined', value: (r: ClientRow) => formatDate(r.created_at, true) },
      ],
      filtered,
    );

  return (
    <div>
      <PanelHeader
        title="Users"
        description="Customers who created an account on the website (role: client)."
        action={
          <button onClick={load} className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 border border-slate-700 hover:border-primaryCyan px-3 py-2 rounded-lg self-start">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        }
      />

      <FilterBar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search name, email or mobile…"
        selects={[
          {
            label: 'Mobile',
            value: mobile,
            onChange: setMobile,
            options: [
              { value: 'with', label: 'Has mobile number' },
              { value: 'without', label: 'No mobile number' },
            ],
          },
          {
            label: 'Verification',
            value: verified,
            onChange: setVerified,
            options: [
              { value: 'yes', label: 'Email verified' },
              { value: 'no', label: 'Not verified yet' },
            ],
          },
        ]}
        dateLabel="Joined"
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
        <LoadingState label="Loading users…" />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <div className={t.wrapper}>
          <div className="overflow-x-auto">
            <table className={t.table}>
              <thead className={t.thead}>
                <tr>
                  <th className={t.th}>Name</th>
                  <th className={t.th}>Email</th>
                  <th className={t.th}>Mobile</th>
                  <th className={t.th}>Status</th>
                  <th className={t.th}>Joined</th>
                  <th className={`${t.th} text-right`}>Action</th>
                </tr>
              </thead>
              <tbody className={t.tbody}>
                {pageRows.length === 0 ? (
                  <EmptyRow colSpan={6} filtered={isFiltered} />
                ) : (
                  pageRows.map((r) => (
                    <tr key={r.id} className={t.tr}>
                      <td className={`${t.td} font-bold text-white`}>
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-full bg-primaryCyan/15 text-primaryCyan flex items-center justify-center text-xs font-black flex-shrink-0">
                            {r.name.charAt(0).toUpperCase()}
                          </span>
                          {r.name}
                        </div>
                      </td>
                      <td className={t.td}>
                        <a href={`mailto:${r.email}`} className="flex items-center gap-1.5 text-slate-300 hover:text-primaryCyan">
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
                      <td className={`${t.td} whitespace-nowrap`}>
                        <span
                          className={`inline-block border rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            r.email_verified ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40' : 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                          }`}
                        >
                          {r.email_verified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td className={`${t.td} whitespace-nowrap text-slate-300`}>{formatDate(r.created_at, true)}</td>
                      <td className={`${t.td} text-right`}>
                        <button
                          onClick={() => setToDelete(r)}
                          className="p-2 bg-red-500/15 hover:bg-red-600 text-red-300 hover:text-white rounded-lg transition-colors"
                          title={`Delete ${r.name}`}
                          aria-label={`Delete ${r.name}`}
                        >
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

      <ConfirmDialog
        open={!!toDelete}
        title="Delete user?"
        busy={deleting}
        confirmLabel="Delete user"
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      >
        <p>
          Are you sure you want to delete <strong className="text-white">{toDelete?.name}</strong>?
          <span className="block text-xs text-slate-400 mt-1">{toDelete?.email}</span>
        </p>
        <p className="text-xs text-slate-400 mt-3">Their account is removed permanently and they will be signed out. This can&apos;t be undone.</p>
      </ConfirmDialog>
    </div>
  );
}
