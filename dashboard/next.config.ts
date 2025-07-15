import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  rewrites: async () => {
    return [
      {
        source: "/demos/regional-latency",
        destination: "/",
      },
      {
        source: "/demos/regional-latency/:path*",
        destination: "/:path*",
      },
    ];
  },
};

export default nextConfig;
