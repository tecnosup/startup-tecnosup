import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    remotePatterns: [],
    unoptimized: true,
  },
};

export default nextConfig;
