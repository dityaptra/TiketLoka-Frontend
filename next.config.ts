import type { NextConfig } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
let apiHost = '127.0.0.1';
try {
  apiHost = new URL(API_URL).hostname;
} catch (e) {
  console.error("Invalid API_URL", e);
}

const nextConfig: NextConfig = {
  // ✅ PERBAIKAN: Hapus blok 'eslint', sisakan typescript saja
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
      {
        protocol: API_URL.startsWith('https') ? 'https' : 'http',
        hostname: apiHost,
        pathname: '/storage/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_URL}/api/:path*`, 
      },
    ];
  },
};

export default nextConfig;