import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Runs as a Node.js server on Hostinger (`npm run build` then `npm start`)
  trailingSlash: true,
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
