'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Mail, Phone, RefreshCw, Trash2, UserPlus, X, FileSpreadsheet, Download, Upload, CheckCircle2, AlertTriangle, KeyRound, MapPin } from 'lucide-react';
import { fetchEmployees, addEmployee, importEmployees, deleteEmployee, resetEmployeePassword, StaffRow, ImportCheck, CreatedEmployee, PasswordReset } from '@/lib/adminData';
import { toast } from '@/lib/toast';
import {
  FilterBar, Pagination, usePagination, PanelHeader, LoadingState, ErrorState, EmptyRow, tableClasses as t,
  formatDate, inDateRange, matchesSearch, exportCsv, ConfirmDialog, uniqueValues,
} from '@/components/admin/ui';


const inputClass =
  'w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primaryCyan';
const labelClass = 'block text-xs font-bold text-slate-300 mb-1';

/* ------------------------------------------------------------------ */
/* Add employee dialog (manual form | Excel / CSV upload)              */
/* ------------------------------------------------------------------ */

function CreatedList({ created }: { created: CreatedEmployee[] }) {
  const needsSharing = created.filter((c) => !c.emailed);
  if (!needsSharing.length) return null;
  return (
    <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-100 space-y-1.5">
      <p className="font-bold flex items-center gap-1.5">
        <KeyRound className="w-4 h-4" /> Welcome email could not be sent — share these sign-in details yourself:
      </p>
      <ul className="space-y-1">
        {needsSharing.map((c) => (
          <li key={c.email} className="font-mono [overflow-wrap:anywhere]">
            {c.employeeCode} · {c.email} — <strong>{c.tempPassword}</strong>
          </li>
        ))}
      </ul>
      <p className="text-amber-200/70">These passwords are shown only once.</p>
    </div>
  );
}

function ManualForm({ onAdded }: { onAdded: (created: CreatedEmployee[]) => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await addEmployee({ name, email, phone, location });
    setSaving(false);
    toast.result(res);
    if (res.success && res.employee) {
      setName('');
      setEmail('');
      setPhone('');
      setLocation('');
      onAdded([res.employee]);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Full Name *</label>
          <input type="text" required maxLength={150} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Priya Sharma" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Email Address *</label>
          <input type="email" required maxLength={150} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="priya@example.com" className={inputClass} />
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
        <div>
          <label className={labelClass}>Location *</label>
          <input type="text" required maxLength={150} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Madurai" className={inputClass} />
        </div>
      </div>
      <button type="submit" disabled={saving} className="w-full bg-primaryCyan text-navyDark font-extrabold text-xs py-3 rounded-xl hover:brightness-110 disabled:opacity-60">
        {saving ? 'Adding…' : 'Add Employee'}
      </button>
    </form>
  );
}

function ExcelImport({ onAdded }: { onAdded: (created: CreatedEmployee[]) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [checks, setChecks] = useState<ImportCheck[] | null>(null);
  const [busy, setBusy] = useState(false);

  const validCount = checks?.filter((c) => !c.errors.length).length ?? 0;

  const preview = async (chosen: File) => {
    setFile(chosen);
    setChecks(null);
    setBusy(true);
    try {
      setChecks((await importEmployees(chosen, 'preview')).checks);
    } catch (err: any) {
      toast.error(err?.message || 'Could not read the file.');
      setFile(null);
    } finally {
      setBusy(false);
    }
  };

  const runImport = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const res = await importEmployees(file, 'import');
      toast.success(res.message || 'Employees imported.');
      setFile(null);
      setChecks(null);
      onAdded(res.created ?? []);
    } catch (err: any) {
      toast.error(err?.message || 'Import failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-700 bg-navyDark/40 p-3">
        <p className="text-xs text-slate-300">
          Columns: <strong>Name</strong>, <strong>Email</strong>, <strong>Location</strong>, <strong>Mobile</strong> (optional). Codes and passwords are generated. Up to 200 rows.
        </p>
        <a
          href="/api/admin/employees/template/"
          className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-primaryCyan border border-primaryCyan/40 hover:bg-primaryCyan/10 px-3 py-2 rounded-lg flex-shrink-0"
        >
          <Download className="w-3.5 h-3.5" /> Download template
        </a>
      </div>

      <label
        htmlFor="employee-file"
        className={`flex flex-col items-center justify-center gap-2 min-h-[110px] rounded-xl border-2 border-dashed border-slate-600 hover:border-primaryCyan bg-slate-900/60 cursor-pointer ${busy ? 'opacity-70 cursor-wait' : ''}`}
      >
        <FileSpreadsheet className="w-7 h-7 text-slate-400" />
        <span className="text-xs font-semibold text-slate-300">{file ? file.name : 'Click to choose an Excel (.xlsx) or CSV file'}</span>
        <input
          id="employee-file"
          type="file"
          accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
          disabled={busy}
          onChange={(e) => {
            const chosen = e.target.files?.[0];
            if (chosen) preview(chosen);
            e.target.value = '';
          }}
          className="sr-only"
        />
      </label>

      {busy && !checks && <p className="text-xs text-slate-400 text-center">Checking the file…</p>}

      {checks && (
        <div className="space-y-3">
          <p className="text-xs text-slate-300">
            <strong className="text-emerald-400">{validCount}</strong> ready to import
            {checks.length - validCount > 0 && (
              <>
                , <strong className="text-red-400">{checks.length - validCount}</strong> with problems (will be skipped)
              </>
            )}
            .
          </p>
          <div className="max-h-64 overflow-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-navyDark text-slate-400 uppercase tracking-wider sticky top-0">
                <tr>
                  <th className="px-3 py-2">Row</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Location</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {checks.map((c) => (
                  <tr key={c.row}>
                    <td className="px-3 py-2 text-slate-500">{c.row}</td>
                    <td className="px-3 py-2 text-white [overflow-wrap:anywhere]">{c.name || '—'}</td>
                    <td className="px-3 py-2 text-slate-300 [overflow-wrap:anywhere]">{c.email || '—'}</td>
                    <td className="px-3 py-2 text-slate-300 [overflow-wrap:anywhere]">{c.location || '—'}</td>
                    <td className="px-3 py-2">
                      {c.errors.length ? (
                        <span className="flex items-start gap-1 text-red-300">
                          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-px" /> {c.errors.join('; ')}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            onClick={runImport}
            disabled={busy || validCount === 0}
            className="w-full flex items-center justify-center gap-2 bg-primaryCyan text-navyDark font-extrabold text-xs py-3 rounded-xl hover:brightness-110 disabled:opacity-50"
          >
            <Upload className="w-4 h-4" /> {busy ? 'Importing…' : `Import ${validCount} employee${validCount === 1 ? '' : 's'}`}
          </button>
        </div>
      )}
    </div>
  );
}

function AddEmployeeDialog({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [tab, setTab] = useState<'manual' | 'excel'>('manual');
  const [created, setCreated] = useState<CreatedEmployee[]>([]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleAdded = (list: CreatedEmployee[]) => {
    setCreated(list);
    onAdded();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="add-employee-title">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-navyBlue border border-slate-700 rounded-2xl p-5 sm:p-6 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white" aria-label="Close">
          <X className="w-5 h-5" />
        </button>
        <h2 id="add-employee-title" className="text-lg font-extrabold text-white flex items-center gap-2 mb-4">
          <UserPlus className="w-5 h-5 text-primaryCyan" /> Add Employee
        </h2>

        <div className="grid grid-cols-2 gap-1 bg-slate-800/80 p-1 rounded-lg mb-5" role="tablist">
          {(['manual', 'excel'] as const).map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`py-2 rounded-md text-xs font-bold transition-all ${tab === id ? 'bg-primaryCyan text-navyDark' : 'text-slate-400 hover:text-white'}`}
            >
              {id === 'manual' ? 'Manual Form' : 'Upload Excel / CSV'}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <CreatedList created={created} />
          {tab === 'manual' ? <ManualForm onAdded={handleAdded} /> : <ExcelImport onAdded={handleAdded} />}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Employees page                                                      */
/* ------------------------------------------------------------------ */

export default function EmployeesPanel({ currentUserId }: { currentUserId: string }) {
  const [rows, setRows] = useState<StaffRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);
  const [toDelete, setToDelete] = useState<StaffRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toReset, setToReset] = useState<StaffRow | null>(null);
  const [resetting, setResetting] = useState(false);
  const [resetResult, setResetResult] = useState<PasswordReset | null>(null);

  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setRows(await fetchEmployees());
    } catch (err: any) {
      setError(err.message || 'Could not load employees.');
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
          matchesSearch(search, r.name, r.email, r.phone, r.employee_code, r.location) &&
          (!location || r.location === location) &&
          inDateRange(r.created_at, dateFrom, dateTo),
      ),
    [rows, search, location, dateFrom, dateTo],
  );
  const { page, pageCount, pageRows, setPage } = usePagination(filtered);
  const isFiltered = !!(search || location || dateFrom || dateTo);

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    const res = await deleteEmployee(toDelete.id);
    setDeleting(false);
    if (res.success) setRows((rs) => rs.filter((r) => r.id !== toDelete.id));
    setToDelete(null);
    toast.result(res);
  };

  const confirmReset = async () => {
    if (!toReset) return;
    setResetting(true);
    const res = await resetEmployeePassword(toReset.id);
    setResetting(false);
    setToReset(null);
    toast.result(res);
    // Email failed: show the new password once so the admin can share it
    if (res.success && res.reset && !res.reset.emailed) setResetResult(res.reset);
  };

  return (
    <div>
      <PanelHeader
        title="Employees"
        description="Employees who can sign in to this dashboard. They manage inquiries, subscriptions and content; only admins manage employees and site settings."
        action={
          <div className="flex gap-2 self-start">
            <button onClick={load} className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 border border-slate-700 hover:border-primaryCyan px-3 py-2 rounded-lg">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
            <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 text-xs font-bold bg-primaryCyan text-navyDark px-3 py-2 rounded-lg hover:brightness-110">
              <UserPlus className="w-3.5 h-3.5" /> Add Employee
            </button>
          </div>
        }
      />

      <FilterBar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search name, code, email, mobile or location…"
        selects={[
          {
            label: 'Locations',
            value: location,
            onChange: setLocation,
            options: uniqueValues(rows.map((r) => r.location)).map((v) => ({ value: v, label: v })),
          },
        ]}
        dateLabel="Added"
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFrom={setDateFrom}
        onDateTo={setDateTo}
        onReset={() => {
          setSearch('');
          setLocation('');
          setDateFrom('');
          setDateTo('');
        }}
        onExport={() =>
          exportCsv(
            'employees',
            [
              { label: 'Code', value: (r: StaffRow) => r.employee_code },
              { label: 'Name', value: (r: StaffRow) => r.name },
              { label: 'Email', value: (r: StaffRow) => r.email },
              { label: 'Mobile', value: (r: StaffRow) => r.phone },
              { label: 'Location', value: (r: StaffRow) => r.location },
              { label: 'Added', value: (r: StaffRow) => formatDate(r.created_at, true) },
            ],
            filtered,
          )
        }
        resultCount={filtered.length}
        totalCount={rows.length}
      />

      {loading ? (
        <LoadingState label="Loading employees…" />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <div className={t.wrapper}>
          <div className="overflow-x-auto">
            <table className={t.table}>
              <thead className={t.thead}>
                <tr>
                  <th className={t.th}>Code</th>
                  <th className={t.th}>Name</th>
                  <th className={t.th}>Email</th>
                  <th className={t.th}>Mobile</th>
                  <th className={t.th}>Location</th>
                  <th className={t.th}>Added</th>
                  <th className={`${t.th} text-right`}>Action</th>
                </tr>
              </thead>
              <tbody className={t.tbody}>
                {pageRows.length === 0 ? (
                  <EmptyRow colSpan={7} filtered={isFiltered} />
                ) : (
                  pageRows.map((r) => (
                    <tr key={r.id} className={t.tr}>
                      <td className={`${t.td} font-mono text-xs text-primaryCyan whitespace-nowrap`}>{r.employee_code || '—'}</td>
                      <td className={`${t.td} font-bold text-white`}>
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-full bg-primaryCyan/15 text-primaryCyan flex items-center justify-center text-xs font-black flex-shrink-0">
                            {r.name.charAt(0).toUpperCase()}
                          </span>
                          <span>
                            {r.name}
                            {r.id === currentUserId && <span className="ml-1.5 text-[10px] font-semibold text-slate-400">(you)</span>}
                          </span>
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
                      <td className={`${t.td} text-slate-300`}>
                        {r.location ? (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-primaryCyan" /> {r.location}
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className={`${t.td} whitespace-nowrap text-slate-300`}>{formatDate(r.created_at, true)}</td>
                      <td className={`${t.td} text-right`}>
                        {r.role === 'employee' && r.id !== currentUserId && (
                          <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setToReset(r)}
                            className="p-2 bg-primaryCyan/15 hover:bg-primaryCyan text-primaryCyan hover:text-navyDark rounded-lg transition-colors"
                            title={`Reset password for ${r.name}`}
                            aria-label={`Reset password for ${r.name}`}
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setToDelete(r)}
                            className="p-2 bg-red-500/15 hover:bg-red-600 text-red-300 hover:text-white rounded-lg transition-colors"
                            title={`Remove ${r.name}`}
                            aria-label={`Remove ${r.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          </div>
                        )}
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

      {adding && <AddEmployeeDialog onClose={() => setAdding(false)} onAdded={load} />}

      <ConfirmDialog
        open={!!toReset}
        title="Reset password?"
        tone="primary"
        icon={KeyRound}
        confirmLabel="Reset password"
        busyLabel="Resetting…"
        busy={resetting}
        onConfirm={confirmReset}
        onCancel={() => setToReset(null)}
      >
        <p>
          Reset the password for <strong className="text-white">{toReset?.name}</strong>?
          <span className="block text-xs text-slate-400 mt-1">
            {toReset?.employee_code ? `${toReset.employee_code} · ` : ''}
            {toReset?.email}
          </span>
        </p>
        <p className="text-xs text-slate-400 mt-3">A new password is generated and emailed to them, and they are signed out on all devices.</p>
      </ConfirmDialog>

      {resetResult && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="reset-result-title">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setResetResult(null)} />
          <div className="relative w-full max-w-sm bg-navyBlue border border-slate-700 rounded-2xl p-6 shadow-2xl text-center">
            <KeyRound className="w-8 h-8 text-amber-300 mx-auto mb-3" />
            <h2 id="reset-result-title" className="text-lg font-extrabold text-white mb-2">Share the new password</h2>
            <p className="text-xs text-slate-300 mb-3">The email to {resetResult.email} could not be sent. Give {resetResult.name} this password:</p>
            <p className="font-mono text-lg font-bold text-primaryCyan bg-slate-900 border border-slate-700 rounded-xl py-2 mb-2 [overflow-wrap:anywhere]">{resetResult.tempPassword}</p>
            <p className="text-[11px] text-slate-500 mb-4">This is shown only once.</p>
            <button onClick={() => setResetResult(null)} className="w-full py-2.5 rounded-xl text-sm font-bold bg-primaryCyan text-navyDark hover:brightness-110">
              Done
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!toDelete} title="Remove employee?" busy={deleting} confirmLabel="Remove" onConfirm={confirmDelete} onCancel={() => setToDelete(null)}>
        <p>
          Are you sure you want to remove <strong className="text-white">{toDelete?.name}</strong>?
          <span className="block text-xs text-slate-400 mt-1">{toDelete?.email}</span>
        </p>
        <p className="text-xs text-slate-400 mt-3">They will be signed out and can no longer access the dashboard.</p>
      </ConfirmDialog>
    </div>
  );
}
