/** @type {import('next').NextConfig} */
const distDir = process.env.NEXT_DIST_DIR || (process.env.NODE_ENV === 'development' ? '.next-dev' : '.next');

const nextConfig = {
  distDir,
  output: "standalone",
  reactStrictMode: true,
  async rewrites() {
    // Local target modes use a same-origin proxy, avoiding VPS CORS changes.
    const api = process.env.API_PROXY_TARGET;
    return api ? [{ source: "/api/v1/:path*", destination: `${api.replace(/\/$/, "")}/:path*` }] : [];
  },
  async redirects() {
    return [
      { source: "/logo.png", destination: "/brand/logo-transparent.png", permanent: true },
      { source: "/logo-transparent.png", destination: "/brand/logo-transparent.png", permanent: true },
      { source: "/logo-dark.png", destination: "/brand/logo-dark.png", permanent: true },
      { source: "/logo-white.png", destination: "/brand/logo-white.png", permanent: true },
      { source: "/logo-512.png", destination: "/icon.png", permanent: true },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
