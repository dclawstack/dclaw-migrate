/** @type {import('next').NextConfig} */
const nextConfig = {
  // All /api/* calls are rewritten server-side to BACKEND_URL.
  // The browser never sees the backend URL — no CORS issues, no baked-in env vars.
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8033";
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: "/health/:path*",
        destination: `${backendUrl}/health/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
