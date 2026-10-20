import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    loader: 'custom',
    loaderFile: './src/lib/images/loader.ts',
    deviceSizes: [640, 960, 1280, 1920],
    imageSizes: [32, 48, 64, 96, 128, 160, 256, 384, 512],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async headers() {
    return [{source:'/img/optimized/:path*',headers:[{key:'Cache-Control',value:'public, max-age=31536000, immutable'}]}];
  },
};

export default nextConfig;

