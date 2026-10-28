/** @type {import('next').NextConfig} */
const distDir = process.env.NEXT_DIST_DIR || (process.env.NODE_ENV === 'development' ? '.next-dev' : '.next');

const nextConfig = {
  distDir,
  output: "standalone",
  reactStrictMode: true,
  async headers() {
    const headers = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "same-origin" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Content-Security-Policy", value: "frame-ancestors 'self'; base-uri 'self'; object-src 'none'" },
    ];
    if (process.env.NODE_ENV === "production") headers.push({ key: "Strict-Transport-Security", value: "max-age=31536000" });
    return [{ source: "/:path*", headers }];
  },
  async rewrites() {
    // Local target modes use a same-origin proxy, avoiding VPS CORS changes.
    const api = process.env.API_PROXY_TARGET;
    return api ? [{ source: "/api/v1/:path*", destination: `${api.replace(/\/$/, "")}/:path*` }] : [];
  },
  async redirects() {
    return [
      { source: "/student/receipts/:reference", destination: "/student?tab=passes", permanent: false },
      { source: "/dashboard/billing/receipts/:reference", destination: "/dashboard?tab=billing-saas", permanent: false },
      { source: "/dashboard/billing/invoices/:reference", destination: "/dashboard?tab=billing-progressrooms", permanent: false },
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
