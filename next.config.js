/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Proxy API through Next so the browser only talks to :3000 (avoids CORS / localhost vs 127.0.0.1 issues).
  async rewrites() {
    return [
      {
        source: '/backend-api/:path*',
        destination: 'http://127.0.0.1:8000/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
