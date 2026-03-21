/** @type {import('next').NextConfig} */
const API_ORIGIN = (process.env.API_ORIGIN || 'http://127.0.0.1:8000').replace(/\/$/, '');

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: '/shiksha-api', destination: `${API_ORIGIN}/` },
      { source: '/shiksha-api/', destination: `${API_ORIGIN}/` },
      { source: '/shiksha-api/:path*', destination: `${API_ORIGIN}/:path*` },
    ];
  },
};

module.exports = nextConfig;
