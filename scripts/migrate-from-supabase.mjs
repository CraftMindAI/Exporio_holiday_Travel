// ONE-TIME: copy all data from the old Supabase Postgres database into Hostinger MySQL.
//
//   npm run db:migrate-from-supabase            copy everything (safe to re-run: rows are upserted by id)
//   npm run db:migrate-from-supabase -- --dry   only print what would be copied
//   ... -- --skip-images                        copy data but keep Supabase Storage image URLs as they are
//
// Reads Supabase through DIRECT_URL (Postgres) and writes MySQL through HOSTIGER_DATABASE_URL (Prisma).
// Images stored in Supabase Storage are re-uploaded to Hostinger via FTP and their URLs rewritten,
// so nothing depends on Supabase afterwards. Users keep their existing (bcrypt) passwords.
import { Readable } from "node:stream";
import { randomBytes } from "node:crypto";
import pg from "pg";
import { Client as FtpClient } from "basic-ftp";
import { PrismaClient } from "@prisma/client";
import { loadEnv } from "./_env.mjs";

const env = { ...loadEnv(), ...process.env };
process.env.HOSTIGER_DATABASE_URL ??= env.HOSTIGER_DATABASE_URL;
const DRY = process.argv.includes("--dry");
const SKIP_IMAGES = process.argv.includes("--skip-images");

for (const key of ["DIRECT_URL", "HOSTIGER_DATABASE_URL"]) {
  if (!env[key]) {
    console.error(`${key} is not set in .env`);
    process.exit(1);
  }
}

const source = new pg.Client({ connectionString: env.DIRECT_URL, ssl: { rejectUnauthorized: false } });
const prisma = new PrismaClient(); // one client for this script run

/* ---------- Supabase Storage -> FTP ---------- */

const STORAGE_RE = /^https:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/public\//i;
const movedImages = new Map();
let ftp = null;

async function moveImage(url) {
  if (!url || !STORAGE_RE.test(url)) return url;
  if (movedImages.has(url)) return movedImages.get(url);
  if (DRY || SKIP_IMAGES) return url;

  const res = await fetch(url);
  if (!res.ok) {
    console.warn(`  ! could not download ${url} (${res.status}); keeping the old URL`);
    return url;
  }
  const ext = (url.split("?")[0].split(".").pop() || "jpg").toLowerCase().slice(0, 5);
  const safeExt = ["jpg", "jpeg", "png", "webp", "gif", "avif"].includes(ext) ? ext : "jpg";
  const fileName = `migrated-${Date.now()}-${randomBytes(4).toString("hex")}.${safeExt}`;

  if (!ftp) {
    ftp = new FtpClient(30_000);
    await ftp.access({
      host: (env.FTP_HOST || "").replace(/^ftps?:\/\//, ""),
      port: Number(env.FTP_PORT || 21),
      user: env.FTP_USER,
      password: env.FTP_PASSWORD,
      secure: false,
    });
    if (env.FTP_UPLOAD_DIR) await ftp.ensureDir(env.FTP_UPLOAD_DIR);
  }
  await ftp.uploadFrom(Readable.from(Buffer.from(await res.arrayBuffer())), fileName);

  // Served by the app's /media route (app/media/[file]/route.ts)
  const newUrl = `/media/${fileName}`;
  movedImages.set(url, newUrl);
  console.log(`  moved image -> ${newUrl}`);
  return newUrl;
}

/* ---------- helpers ---------- */

const rows = async (sql) => (await source.query(sql)).rows;
const dec = (v) => (v == null ? null : String(v));
const arr = (v) => (Array.isArray(v) ? v : v == null ? null : v);

async function copy(label, items, upsertOne) {
  console.log(`${label}: ${items.length}`);
  if (DRY) return;
  for (const item of items) await upsertOne(item);
}

/* ---------- copy ---------- */

try {
  await source.connect();
  console.log(DRY ? "DRY RUN - nothing will be written\n" : "Copying Supabase -> Hostinger MySQL\n");

  // Users: only staff accounts are copied (customer / client accounts no longer exist)
  const users = await rows(`select id, name, email, phone, role, password, created_at from public.users where role = 'admin'`);
  await copy("users", users, (u) => {
    const data = {
      name: u.name,
      email: u.email.toLowerCase(),
      phone: u.phone,
      role: "admin",
      password: u.password,
      createdAt: u.created_at,
    };
    return prisma.user.upsert({ where: { id: u.id }, create: { id: u.id, ...data }, update: data });
  });

  const tours = await rows("select * from public.tours");
  await copy("tours", tours, async (t) => {
    const data = {
      title: t.title,
      slug: t.slug,
      location: t.location,
      category: t.category,
      price: dec(t.price),
      originalPrice: dec(t.original_price),
      durationNights: t.duration_nights,
      durationDays: t.duration_days,
      rating: dec(t.rating) ?? "5",
      reviewCount: t.review_count ?? 0,
      imageUrl: await moveImage(t.image_url),
      highlights: arr(t.highlights),
      inclusions: arr(t.inclusions),
      exclusions: arr(t.exclusions),
      itinerary: t.itinerary,
      isFeatured: !!t.is_featured,
      isTrending: !!t.is_trending,
      // Existing tours are not "new"; don't email subscribers about them
      subscribersNotifiedAt: t.subscribers_notified_at ?? t.created_at,
      createdAt: t.created_at,
    };
    return prisma.tour.upsert({ where: { id: t.id }, create: { id: t.id, ...data }, update: data });
  });

  const places = await rows("select * from public.tour_places_visit");
  await copy("tour_places_visit", places, async (p) => {
    const data = {
      tourId: p.tour_id,
      placeName: p.place_name,
      description: p.description,
      dayNumber: p.day_number,
      imageUrl: await moveImage(p.image_url),
      createdAt: p.created_at,
    };
    return prisma.tourPlaceVisit.upsert({ where: { id: p.id }, create: { id: p.id, ...data }, update: data });
  });

  const destinations = await rows("select * from public.destinations");
  await copy("destinations", destinations, async (d) => {
    const data = {
      name: d.name,
      slug: d.slug,
      category: d.category,
      imageUrl: await moveImage(d.image_url),
      packageCount: d.package_count ?? 10,
      description: d.description,
      createdAt: d.created_at,
    };
    return prisma.destination.upsert({ where: { id: d.id }, create: { id: d.id, ...data }, update: data });
  });

  const blogs = await rows("select * from public.blogs");
  await copy("blogs", blogs, async (b) => {
    const data = {
      title: b.title,
      slug: b.slug || `${b.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")}-${b.id.slice(0, 4)}`,
      imageUrl: await moveImage(b.image_url),
      content: b.content,
      author: b.author,
      createdAt: b.created_at,
    };
    return prisma.blog.upsert({ where: { id: b.id }, create: { id: b.id, ...data }, update: data });
  });

  const tourIds = new Set(tours.map((t) => t.id));
  const statuses = new Set(["pending", "contacted", "confirmed", "cancelled"]);
  const inquiries = await rows("select * from public.inquiries");
  await copy("inquiries", inquiries, (i) => {
    const data = {
      name: i.name,
      email: i.email ?? "",
      phone: i.phone,
      tourId: i.tour_id && tourIds.has(i.tour_id) ? i.tour_id : null,
      tourTitle: i.tour_title,
      travelDate: i.travel_date,
      guestsCount: i.guests_count ?? 2,
      message: i.message,
      status: statuses.has(i.status) ? i.status : "pending",
      createdAt: i.created_at,
    };
    return prisma.inquiry.upsert({ where: { id: i.id }, create: { id: i.id, ...data }, update: data });
  });

  const contacts = await rows("select * from public.contacts");
  await copy("contacts", contacts, (c) => {
    const data = { name: c.name, email: c.email, phone: c.phone, message: c.message, status: c.status ?? "unread", createdAt: c.created_at };
    return prisma.contact.upsert({ where: { id: c.id }, create: { id: c.id, ...data }, update: data });
  });

  // name/phone/location only exist if the Supabase subscriber-profile migration was applied
  const subscribers = await rows("select * from public.subscribers");
  await copy("subscribers", subscribers, (s) => {
    const data = { email: s.email.toLowerCase(), name: s.name ?? null, phone: s.phone ?? null, location: s.location ?? null, subscribedAt: s.subscribed_at };
    return prisma.subscriber.upsert({ where: { email: data.email }, create: { id: s.id, ...data }, update: data });
  });

  console.log(DRY ? "\nDry run finished." : `\nDone. ${movedImages.size} image(s) moved from Supabase Storage to FTP.`);
} finally {
  ftp?.close();
  await source.end();
  await prisma.$disconnect();
}
