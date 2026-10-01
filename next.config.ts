import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "etripto.in" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  basePath: "/Exporio_holiday_Travel",
  env: {
    NEXT_PUBLIC_BASE_PATH: "/Exporio_holiday_Travel",
  },
};

export default nextConfig;
