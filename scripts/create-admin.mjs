// Create an admin in the MySQL `users` table, or reset an existing admin's password.
//
// Usage:
//   npm run db:seed                                   (uses VITE_ADMIN_EMAIL / VITE_ADMIN_PASSWORD from .env)
//   node scripts/create-admin.mjs <email> <password> [name] [mobile]
//
// .env lookup order: ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME / ADMIN_PHONE, then VITE_ADMIN_EMAIL / VITE_ADMIN_PASSWORD.
// Needs HOSTIGER_DATABASE_URL and the tables from `npx prisma migrate deploy`.
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { loadEnv } from "./_env.mjs";

const env = { ...loadEnv(), ...process.env };
process.env.HOSTIGER_DATABASE_URL ??= env.HOSTIGER_DATABASE_URL;

const [argEmail, argPassword, argName, argPhone] = process.argv.slice(2);
const email = (argEmail || env.ADMIN_EMAIL || env.VITE_ADMIN_EMAIL || "").trim().toLowerCase();
const password = argPassword || env.ADMIN_PASSWORD || env.VITE_ADMIN_PASSWORD || "";
const name = (argName || env.ADMIN_NAME || "Admin").trim();
const phone = (argPhone || env.ADMIN_PHONE || "").trim() || null;

if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error("Usage: node scripts/create-admin.mjs <email> <password> [name] [mobile]");
  process.exit(1);
}
if (password.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}
if (!process.env.HOSTIGER_DATABASE_URL) {
  console.error("HOSTIGER_DATABASE_URL is not set (add it to .env).");
  process.exit(1);
}

// One client for this script run
const prisma = new PrismaClient();

try {
  const hash = await bcrypt.hash(password, 12);
  const existing = await prisma.user.findUnique({ where: { email } });

  await prisma.user.upsert({
    where: { email },
    create: { email, name, phone, password: hash, role: "admin", emailVerifiedAt: new Date() },
    update: { name, ...(phone ? { phone } : {}), password: hash, role: "admin", emailVerifiedAt: existing?.emailVerifiedAt ?? new Date() },
  });

  // A new password signs the admin out everywhere
  if (existing) await prisma.session.deleteMany({ where: { userId: existing.id } });

  console.log(existing ? `Admin updated: ${email}` : `Admin created: ${email}`);
} finally {
  await prisma.$disconnect();
}
