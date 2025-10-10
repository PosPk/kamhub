/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  async rewrites() {
    return [
      { source: '/tg', destination: '/tg/index.html' },
    ];
  },
};
module.exports = nextConfig;

