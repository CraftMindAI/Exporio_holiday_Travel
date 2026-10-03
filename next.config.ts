import type { NextConfig } from "next";

// `npm run deploy` builds a static copy of the public site for GitHub Pages
// (scripts/build-pages.mjs sets STATIC_EXPORT=1); the API keeps running on Hostinger.
const isPages = process.env.STATIC_EXPORT === "1";
const basePath = isPages ? "/Exporio_holiday_Travel" : "";

const nextConfig: NextConfig = {
  // Runs as a Node.js server on Hostinger (`npm run build` then `npm start`)
  trailingSlash: true,
  // One build worker for the static export, to stay within the shared MySQL connection limit
  ...(isPages ? { output: "export" as const, basePath, experimental: { cpus: 1 } } : {}),
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  // Optional separate build folder (lets a test build run alongside `next dev`)
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "etripto.in" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "subhkart.in" },
    ],
  },
  // Keep Prisma's native engine out of the webpack bundle
  serverExternalPackages: ["@prisma/client", "bcryptjs", "basic-ftp", "nodemailer"],
};

export default nextConfig;
