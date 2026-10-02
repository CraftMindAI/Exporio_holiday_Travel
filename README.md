# Exporio Holidays

Next.js 15 (server-rendered) + Prisma + Hostinger MySQL. Images are uploaded to Hostinger over FTP and served by the app at `/media/<file>`; emails go out through Gmail.

## Local development

```bash
cp .env.example .env        # then fill in real values
npm install                 # also runs `prisma generate`
npx prisma migrate deploy   # create the tables
npm run db:seed             # create the admin from VITE_ADMIN_EMAIL / VITE_ADMIN_PASSWORD
npm run dev                 # http://localhost:3000
```

Health check: `GET /api/health` runs `SELECT 1` against the database.

## Database commands

| Command | What it does |
| --- | --- |
| `npx prisma generate` | Regenerate the Prisma client (runs automatically on `npm install` and `npm run build`) |
| `npx prisma migrate deploy` | Apply the migrations in `prisma/migrations` to the database (`npm run db:migrate`) |
| `npm run db:seed` | Create the admin user, or reset its password |
| `npm run db:migrate-from-supabase` | One-time copy of the old Supabase data into MySQL (needs `DIRECT_URL`) |

Every part of the app imports the single shared client from `lib/prisma.ts`. Never create another `PrismaClient` in app code.

## Deploying on Hostinger

### 1. Create the MySQL database
hPanel → **Databases → MySQL Databases**: create the database and user. Note the **host, port, database name and username** exactly as hPanel shows them.

Build the connection string from those values, URL-encoding special characters in the password (`@` → `%40`, `#` → `%23`, `:` → `%3A`, `/` → `%2F`):

```
mysql://USERNAME:ENCODED_PASSWORD@HOST:PORT/DATABASE?connection_limit=5&pool_timeout=20
```

### 2. Create the Node.js app
hPanel → **Websites → Add website → Node.js app**: connect the GitHub repo (or upload the project).

- Node version: **20 or newer**
- Build command: `npm run build`
- Start command: `npm start`

### 3. Enter the environment variables
In the Node.js app's settings → **Environment variables**, add every key from `.env.example` with real values:
`HOSTIGER_DATABASE_URL`, `NEXT_PUBLIC_SITE_URL`, `EMAIL_USER`, `EMAIL_PASSWORD`, `FTP_HOST`, `FTP_PORT`, `FTP_USER`, `FTP_PASSWORD`, `FTP_UPLOAD_DIR`, `ADMIN_NOTIFICATION_EMAIL` (optional), `VITE_ADMIN_EMAIL`, `VITE_ADMIN_PASSWORD`.

Don't upload a `.env` file to the server; it's git-ignored on purpose.

### 4. Run the migration (creates the tables)
Pick one:

- **Over SSH** (hPanel → Advanced → SSH Access), in the app's folder:
  ```bash
  npx prisma migrate deploy
  npm run db:seed
  ```
- **From your computer**: enable **Remote MySQL** for your IP (hPanel → Databases → Remote MySQL), use the remote host hPanel shows in your local `.env`, then run the same two commands locally.
- **No SSH access**: temporarily set the build command to `npx prisma migrate deploy && npm run build` and redeploy. It's safe to leave this in, since `migrate deploy` only applies migrations that haven't run yet.

To copy the old Supabase data, run `npm run db:migrate-from-supabase` once (with `DIRECT_URL` set). It's safe to re-run.

### 5. Restart the app
After changing environment variables or running migrations: hPanel → **Websites → your Node.js app → Restart** (or **Redeploy** to rebuild from the latest code). Then open `https://your-domain/api/health`. It should return `{"status":"ok","database":"connected"}`.
