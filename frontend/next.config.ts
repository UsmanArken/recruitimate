import type { NextConfig } from "next";

const FASTAPI_URL = process.env.FASTAPI_URL ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  output: "standalone",
  devIndicators: false,
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${FASTAPI_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
