// Wipe every app table + all auth users, then re-apply all migrations in order.
//
//   node scripts/reset-db.mjs            # reset only
//   node scripts/reset-db.mjs --seed     # reset, then seed the admin account
//
// DESTRUCTIVE: this deletes all data (including every auth user). Only run it
// against a database you are willing to lose.
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { Client } from "pg";
import { loadEnv, projectRoot } from "./_env.mjs";
import { seedAdmin } from "./seed-admin.mjs";

const env = loadEnv();

const DROP_SQL = `
drop table if exists
  public.calendar_event_invites,
  public.calendar_events,
  public.student_enquiries,
  public.students,
  public.meeting_preferences,
  public.demo_requests,
  public.new_student_requests,
  public.existing_student_requests,
  public.profiles
  cascade;

drop function if exists public.is_admin() cascade;

-- Removing auth users cascades to anything still keyed off them.
delete from auth.users;
`;

// Storage tables are protected from direct SQL deletes, so clear the
// migration-created bucket through the Storage API instead.
async function clearStorage(env) {
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const admin = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    const { data: list } = await admin.storage.from("event-attachments").list();
    if (list?.length) {
      await admin.storage
        .from("event-attachments")
        .remove(list.map((o) => o.name));
      console.log(`  cleared ${list.length} storage object(s)`);
    }
  } catch {
    // Bucket may not exist yet on a first run — nothing to clear.
  }
}

async function main() {
  const seed = process.argv.includes("--seed");

  const client = new Client({
    connectionString: env.DIRECT_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  try {
    console.log("Clearing storage …");
    await clearStorage(env);

    console.log("Dropping app tables + auth users …");
    await client.query(DROP_SQL);

    const dir = path.join(projectRoot, "supabase", "migrations");
    const files = readdirSync(dir)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    for (const file of files) {
      const sql = readFileSync(path.join(dir, file), "utf8");
      await client.query(sql);
      console.log(`  applied ${file}`);
    }
  } finally {
    await client.end();
  }

  console.log("Database reset complete.");

  if (seed) {
    console.log("Seeding admin account …");
    await seedAdmin();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
