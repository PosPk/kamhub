/** @type {import('next').NextConfig} */
const nextConfig = { 
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['pg'],
  },
  eslint: {
    // Не блокировать сборку из-за ESLint ошибок (линт остаётся в CI)
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
};
module.exports = nextConfig;

