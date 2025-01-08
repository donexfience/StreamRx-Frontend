import { NextConfig } from "next";
const nextConfig: NextConfig = {
  // Enable hostname access
  webpack: (config, { isServer }) => {
    return config;
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "30mb",
    },
  },
  // Optional: Configure allowed hosts if needed
  headers: async () => {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*", 
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
