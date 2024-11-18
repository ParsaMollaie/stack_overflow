/** @type {import('next').NextConfig} */
const nextConfig = {
  headers: {
    source: '/api/(.*)',
  },
  headers: [
    {
      key: 'Access-Control-Allow-Origin',
      value: 'https://dev-flow-sable.vercel.app',
    },
    {
      key: 'Access-Control-Allow-Methods',
      value: 'GET, POST, OPTIONS',
    },
    {
      key: 'Access-Control-Allow-Headers',
      value: 'Content-Type',
    },
  ],
  experimental: {
    serverActions: true,
    mdxRs: true,
    serverComponentsExternalPackages: ['mongoose'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
      },
      {
        protocol: 'http',
        hostname: '*',
      },
    ],
  },
};

export default nextConfig;
