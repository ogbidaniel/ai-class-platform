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
    ],
  },
};

export default nextConfig;
