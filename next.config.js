/** @type {import('next').NextConfig} */
const nextConfig = {
  // Suppress specific warnings
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Fix for @react-pdf/renderer in serverless environments
      config.resolve.alias = {
        ...config.resolve.alias,
        canvas: false,
      };
      config.externals = [...(config.externals || []), 'canvas'];
    }
    return config;
  },
}

module.exports = nextConfig
