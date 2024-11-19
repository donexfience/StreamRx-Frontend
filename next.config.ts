import { NextConfig } from 'next';
const nextConfig: NextConfig = {
  // Enable hostname access
  webpack: (config, { isServer }) => {
    return config;
  },
  // Optional: Configure allowed hosts if needed
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'  // Be more restrictive in production
          }
        ],
      },
    ];
  }
};

module.exports = nextConfig;