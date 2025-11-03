import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbo: undefined
  },
  
  output: 'standalone',
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;