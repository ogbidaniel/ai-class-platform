import { hostname } from 'os';

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        hostname: 'cdn.tailgrids.com',
      },
      {
        hostname: 'gstatic.com',
      },
      {
        hostname: 'img.clerk.com',
      },
    ],
  },
};

export default nextConfig;
