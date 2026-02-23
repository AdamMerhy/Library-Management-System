import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  env: {
    AUTH_URL: process.env.VERCEL
      ? "https://library-management-system-iota-tan.vercel.app"
      : process.env.AUTH_URL,
  },
};

export default nextConfig;
