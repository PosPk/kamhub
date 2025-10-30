/** @type {import('next').NextConfig} */
const nextConfig = { 
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['pg'],
  },
  // Optimize for smaller build
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Reduce output size
  output: 'standalone',
  // Optimize images
  images: {
    unoptimized: true, // Timeweb Apps limitation
  },
};
module.exports = nextConfig;

