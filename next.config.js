/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  poweredByHeader: false,
  reactStrictMode: true,
  webpack: (config) => {
    // 트리 쉐이킹 강화
    config.optimization.usedExports = true;
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    formats: ['image/webp'],
  },
  experimental: {
    optimizeCss: true,
  },
}

module.exports = nextConfig 