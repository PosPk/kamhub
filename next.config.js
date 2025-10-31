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
  // Enable standalone for Timeweb Apps deployment
  output: 'standalone',
  // Optimize images
  images: {
    unoptimized: true,
    domains: [],
  },
  // Disable x-powered-by header
  poweredByHeader: false,
  // Disable Sentry in build to reduce size
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@sentry/nextjs': false,
      };
    }
    return config;
  },
};
module.exports = nextConfig;

