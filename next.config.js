/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Оптимальная сборка для контейнеров/ВМ (Timeweb Cloud)
  output: 'standalone',
  images: { unoptimized: true },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  experimental: {
    serverComponentsExternalPackages: ['pg'],
  },
};

module.exports = nextConfig;

