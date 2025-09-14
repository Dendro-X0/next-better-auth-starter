import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      { source: "/login", destination: "/auth/login", permanent: false },
      { source: "/signup", destination: "/auth/signup", permanent: false },
    ];
  },
  eslint: {
    // Allow preview deployments to proceed even if ESLint fails.
    // Production builds remain strict.
    ignoreDuringBuilds: process.env.VERCEL_ENV === 'preview',
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
    ],
  },
};

export default nextConfig;
