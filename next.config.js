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
  // Output configuration for Timeweb
  output: 'standalone',
  outputFileTracingRoot: process.cwd(),
  // Optimize images
  images: {
    unoptimized: true, // Timeweb Apps limitation
    domains: [],
  },
  // Disable x-powered-by header
  poweredByHeader: false,
};
module.exports = nextConfig;

