import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.dcjoineryni.uk",
          },
        ],
        destination: "https://dcjoineryni.uk/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [];
  },
};

export default nextConfig;
