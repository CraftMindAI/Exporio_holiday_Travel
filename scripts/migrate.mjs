import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { Client } from "pg";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function loadEnv(file) {
  const text = readFileSync(file, "utf8");
  const env = {};
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

const env = loadEnv(path.join(root, ".env"));
const migrationFile = process.argv[2];
if (!migrationFile) {
  console.error("Usage: node scripts/migrate.mjs <path-to-sql-file>");
  process.exit(1);
}

const sql = readFileSync(path.resolve(migrationFile), "utf8");

const client = new Client({
  connectionString: env.DIRECT_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  await client.query(sql);
  console.log(`Applied migration: ${migrationFile}`);
} finally {
  await client.end();
}
