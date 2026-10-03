// Server-only employee management: validation, creation, Excel/CSV import and welcome emails.
import 'server-only';
import ExcelJS from 'exceljs';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { cleanText, normalizeEmail, PHONE_RE } from '@/lib/http';
import { transporter, fromAddress, siteUrl, emailLayout, emailButton, escapeHtml } from '@/lib/mailer';
import { STAFF_LOGIN_PATH } from '@/lib/routes';

export const MAX_IMPORT_ROWS = 200;

export type EmployeeInput = { name: string; email: string; phone: string; location: string };
export type RowCheck = { row: number; name: string; email: string; phone: string; location: string; errors: string[] };
export type CreatedEmployee = { email: string; name: string; employeeCode: string; emailed: boolean; tempPassword?: string };

const CODE_PREFIX = 'EMP';

/**
 * Initial password: first name + employee code number + "_@" + current year,
 * e.g. "Priya" + "0001" + "_@" + "2026" = "Priya0001_@2026".
 */
export function employeePassword(name: string, employeeCode: string, year = new Date().getFullYear()): string {
  const first = (name.trim().split(/\s+/)[0] ?? '').replace(/[^A-Za-z]/g, '');
  const namePart = first ? first.charAt(0).toUpperCase() + first.slice(1).toLowerCase() : 'Employee';
  return `${namePart}${employeeCode.replace(CODE_PREFIX, '')}_@${year}`;
}

/** The next free employee code: EMP0001, EMP0002, ... */
async function nextEmployeeCode(): Promise<string> {
  const rows = await prisma.user.findMany({ where: { employeeCode: { startsWith: CODE_PREFIX } }, select: { employeeCode: true } });
  const highest = rows.reduce((max, r) => Math.max(max, Number(r.employeeCode!.slice(CODE_PREFIX.length)) || 0), 0);
  return `${CODE_PREFIX}${String(highest + 1).padStart(4, '0')}`;
}

/** Validate one employee's fields (name, email and location are required). */
export function checkEmployee(raw: Record<string, unknown>): { data?: EmployeeInput; errors: string[] } {
  const name = cleanText(raw.name, 150);
  const email = normalizeEmail(raw.email);
  const phone = cleanText(raw.phone, 30);
  const location = cleanText(raw.location, 150);
  const errors: string[] = [];

  if (!name) errors.push('Name is required');
  if (!email) errors.push('Valid email is required');
  if (phone && !PHONE_RE.test(phone)) errors.push('Mobile number is not valid');
  if (!location) errors.push('Location is required');

  return errors.length ? { errors } : { data: { name, email: email!, phone, location }, errors };
}

/** Emails that already have an account (lower-cased). */
export async function existingEmails(emails: string[]): Promise<Set<string>> {
  if (!emails.length) return new Set();
  const users = await prisma.user.findMany({ where: { email: { in: emails } }, select: { email: true } });
  return new Set(users.map((u) => u.email.toLowerCase()));
}

async function sendWelcomeEmail(input: EmployeeInput, employeeCode: string, password: string): Promise<void> {
  const loginUrl = `${siteUrl}${STAFF_LOGIN_PATH}`;
  const row = (label: string, value: string) =>
    `<tr><td style="padding: 4px 12px 4px 0; color: #64748b;">${label}</td><td>${value}</td></tr>`;
  await transporter.sendMail({
    from: fromAddress,
    to: input.email,
    subject: 'Your Exporio Holidays staff account',
    html: emailLayout(`
      <h2 style="color: #0b2038;">Welcome to the team, ${escapeHtml(input.name)}!</h2>
      <p>An Exporio Holidays staff account has been created for you.</p>
      <table style="border-collapse: collapse; font-size: 14px; margin: 12px 0;">
        ${row('Employee code', `<strong>${escapeHtml(employeeCode)}</strong>`)}
        ${row('Sign-in email', `<strong>${escapeHtml(input.email)}</strong>`)}
        ${row('Password', `<strong style="font-family: monospace; font-size: 15px;">${escapeHtml(password)}</strong>`)}
      </table>
      ${emailButton(loginUrl, 'Sign in to the dashboard')}
      <p style="font-size: 12px; color: #64748b;">For your security, open <strong>Settings</strong> after signing in and change this password.</p>
    `),
  });
}

/** Create the account with the next employee code and the generated password (retries if two codes collide). */
async function createEmployeeAccount(input: EmployeeInput): Promise<{ employeeCode: string; password: string }> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const employeeCode = await nextEmployeeCode();
    const password = employeePassword(input.name, employeeCode);
    try {
      await prisma.user.create({
        data: {
          name: input.name,
          email: input.email,
          phone: input.phone || null,
          location: input.location,
          employeeCode,
          role: 'employee',
          password: await hashPassword(password),
        },
      });
      return { employeeCode, password };
    } catch (err) {
      const target = String((err as Prisma.PrismaClientKnownRequestError)?.meta?.target ?? '');
      const codeTaken = err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002' && target.includes('employee_code');
      if (!codeTaken) throw err;
    }
  }
  throw new Error('Could not allocate an employee code, please try again.');
}

/** Email the login details; if that fails, hand the password back so the admin can share it. */
async function welcome(input: EmployeeInput, employeeCode: string, password: string): Promise<CreatedEmployee> {
  try {
    await sendWelcomeEmail(input, employeeCode, password);
    return { email: input.email, name: input.name, employeeCode, emailed: true };
  } catch (err) {
    console.error('[employees] welcome email failed for', input.email, err);
    return { email: input.email, name: input.name, employeeCode, emailed: false, tempPassword: password };
  }
}

/** Create one employee (validated input, email not yet taken) and email their login details. */
export async function createEmployee(input: EmployeeInput): Promise<CreatedEmployee> {
  const { employeeCode, password } = await createEmployeeAccount(input);
  return welcome(input, employeeCode, password);
}

/**
 * Create many employees: accounts one by one (so codes are allocated in order),
 * then welcome emails a few at a time.
 */
export async function createEmployees(inputs: EmployeeInput[], emailConcurrency = 5): Promise<CreatedEmployee[]> {
  const accounts: { input: EmployeeInput; employeeCode: string; password: string }[] = [];
  for (const input of inputs) accounts.push({ input, ...(await createEmployeeAccount(input)) });

  const results: CreatedEmployee[] = new Array(accounts.length);
  let next = 0;
  const worker = async () => {
    while (next < accounts.length) {
      const i = next++;
      results[i] = await welcome(accounts[i].input, accounts[i].employeeCode, accounts[i].password);
    }
  };
  await Promise.all(Array.from({ length: Math.min(emailConcurrency, accounts.length) }, worker));
  return results;
}

/* ------------------------------------------------------------------ */
/* Excel / CSV                                                         */
/* ------------------------------------------------------------------ */

const HEADER_ALIASES: Record<keyof EmployeeInput, string[]> = {
  name: ['name', 'full name', 'employee name'],
  email: ['email', 'email address', 'e-mail'],
  phone: ['mobile', 'mobile number', 'phone', 'phone number'],
  location: ['location', 'city', 'branch', 'work location', 'office'],
};

function fieldForHeader(header: string): keyof EmployeeInput | null {
  const h = header.trim().toLowerCase();
  return (Object.keys(HEADER_ALIASES) as (keyof EmployeeInput)[]).find((k) => HEADER_ALIASES[k].includes(h)) ?? null;
}

function cellText(value: ExcelJS.CellValue): string {
  if (value == null) return '';
  if (typeof value === 'object') {
    if ('text' in value && value.text != null) return String(value.text); // hyperlink / rich text cell
    if ('result' in value && value.result != null) return String(value.result); // formula cell
    if ('richText' in value) return value.richText.map((r) => r.text).join('');
  }
  return String(value);
}

/** Minimal CSV parser (quoted fields, commas and newlines inside quotes). */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

/** Read employee rows from an uploaded .xlsx or .csv file (first sheet, header row first). */
export async function readEmployeeFile(fileName: string, data: Buffer): Promise<{ rows: Record<string, string>[]; error?: string }> {
  let table: string[][];
  if (/\.csv$/i.test(fileName)) {
    table = parseCsv(data.toString('utf8').replace(/^﻿/, ''));
  } else if (/\.xlsx$/i.test(fileName)) {
    const workbook = new ExcelJS.Workbook();
    try {
      await workbook.xlsx.load(data as unknown as ArrayBuffer);
    } catch {
      return { rows: [], error: 'Could not read the Excel file. Save it as .xlsx and try again.' };
    }
    const sheet = workbook.worksheets[0];
    if (!sheet) return { rows: [], error: 'The Excel file has no sheets.' };
    table = [];
    sheet.eachRow({ includeEmpty: false }, (row) => {
      const values: string[] = [];
      for (let c = 1; c <= row.cellCount; c++) values.push(cellText(row.getCell(c).value).trim());
      table.push(values);
    });
  } else {
    return { rows: [], error: 'Upload an Excel (.xlsx) or CSV (.csv) file.' };
  }

  const [header, ...body] = table.filter((r) => r.some((v) => v.trim()));
  if (!header) return { rows: [], error: 'The file is empty.' };
  const fields = header.map(fieldForHeader);
  if (!fields.includes('name') || !fields.includes('email') || !fields.includes('location')) {
    return { rows: [], error: 'The first row must contain the column headers "Name", "Email" and "Location" (optional: "Mobile").' };
  }
  if (body.length > MAX_IMPORT_ROWS) return { rows: [], error: `Too many rows: the limit is ${MAX_IMPORT_ROWS} employees per file.` };

  const rows = body.map((values) => {
    const out: Record<string, string> = {};
    fields.forEach((f, i) => {
      if (f) out[f] = (values[i] ?? '').trim();
    });
    return out;
  });
  return { rows };
}

/** Validate all rows: field errors, duplicates inside the file and emails that already have accounts. */
export async function checkEmployeeRows(rows: Record<string, string>[]): Promise<{ checks: RowCheck[]; valid: EmployeeInput[] }> {
  const parsed = rows.map((r) => checkEmployee(r));
  const taken = await existingEmails(parsed.flatMap((p) => (p.data ? [p.data.email] : [])));
  const seen = new Set<string>();
  const valid: EmployeeInput[] = [];

  const checks = parsed.map((p, i) => {
    const errors = [...p.errors];
    if (p.data) {
      if (taken.has(p.data.email)) errors.push('An account with this email already exists');
      else if (seen.has(p.data.email)) errors.push('Duplicate email in this file');
      seen.add(p.data.email);
      if (!errors.length) valid.push(p.data);
    }
    return { row: i + 2, name: rows[i].name ?? '', email: rows[i].email ?? '', phone: rows[i].phone ?? '', location: rows[i].location ?? '', errors };
  });
  return { checks, valid };
}

/** Template workbook admins can fill in. */
export async function employeeTemplate(): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Employees');
  sheet.columns = [
    { header: 'Name', key: 'name', width: 28 },
    { header: 'Email', key: 'email', width: 34 },
    { header: 'Mobile', key: 'phone', width: 20 },
    { header: 'Location', key: 'location', width: 22 },
  ];
  sheet.getRow(1).font = { bold: true };
  sheet.addRow({ name: 'Priya Sharma', email: 'priya@example.com', phone: '+91 9876543210', location: 'Madurai' });
  sheet.getCell('F1').value = 'Employee code and password are generated automatically (e.g. Priya0001_@2026) and emailed to each employee.';
  sheet.getCell('F1').font = { italic: true, color: { argb: 'FF64748B' } };
  return Buffer.from(await workbook.xlsx.writeBuffer());
}

/* ------------------------------------------------------------------ */
/* Password reset (admin action)                                       */
/* ------------------------------------------------------------------ */

export type PasswordReset = { email: string; name: string; emailed: boolean; tempPassword?: string };

async function sendResetEmail(user: { name: string; email: string; employeeCode: string | null }, password: string): Promise<void> {
  await transporter.sendMail({
    from: fromAddress,
    to: user.email,
    subject: 'Your Exporio Holidays password was reset',
    html: emailLayout(`
      <h2 style="color: #0b2038;">Password reset</h2>
      <p>Hi ${escapeHtml(user.name)}, an administrator has reset the password for your Exporio Holidays staff account.</p>
      <table style="border-collapse: collapse; font-size: 14px; margin: 12px 0;">
        ${user.employeeCode ? `<tr><td style="padding: 4px 12px 4px 0; color: #64748b;">Employee code</td><td><strong>${escapeHtml(user.employeeCode)}</strong></td></tr>` : ''}
        <tr><td style="padding: 4px 12px 4px 0; color: #64748b;">Sign-in email</td><td><strong>${escapeHtml(user.email)}</strong></td></tr>
        <tr><td style="padding: 4px 12px 4px 0; color: #64748b;">New password</td><td><strong style="font-family: monospace; font-size: 15px;">${escapeHtml(password)}</strong></td></tr>
      </table>
      ${emailButton(`${siteUrl}${STAFF_LOGIN_PATH}`, 'Sign in to the dashboard')}
      <p style="font-size: 12px; color: #64748b;">You have been signed out on all devices. After signing in, open <strong>Settings</strong> and choose your own password.</p>
    `),
  });
}

/**
 * Reset an employee's password to a new generated one (same format as when they were added),
 * sign them out everywhere and email them the new password.
 */
export async function resetEmployeePassword(userId: string): Promise<PasswordReset> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const password = employeePassword(user.name, user.employeeCode ?? `${CODE_PREFIX}0000`);

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { password: await hashPassword(password) } }),
    prisma.session.deleteMany({ where: { userId } }),
  ]);

  try {
    await sendResetEmail(user, password);
    return { email: user.email, name: user.name, emailed: true };
  } catch (err) {
    console.error('[employees] reset email failed for', user.email, err);
    return { email: user.email, name: user.name, emailed: false, tempPassword: password };
  }
}
