import { NextConfig } from "next";
const nextConfig: NextConfig = {
  // Enable hostname access
  webpack: (config, { isServer }) => {
    return config;
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "500mb",
    },
  },

  images: {
    domains: ['res.cloudinary.com'],
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
