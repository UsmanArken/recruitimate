import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the bottom-left "N" dev tools badge (Route / Turbopack / Route Info) in local dev.
  // Only applies to `npm run dev`; production builds never show it.
  devIndicators: false,
  serverExternalPackages: ["pdf-parse", "mammoth"],
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
