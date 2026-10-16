/** @type {import('next').NextConfig} */
const distDir = process.env.NEXT_DIST_DIR || (process.env.NODE_ENV === 'development' ? '.next-dev' : '.next');

const nextConfig = {
  distDir,
  output: "standalone",
  reactStrictMode: true,
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
