import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  assetPrefix: isProd ? process.env.NEXT_PUBLIC_REWRITE_PREFIX : undefined,
  basePath: isProd ? process.env.NEXT_PUBLIC_REWRITE_PREFIX : undefined,
};

export default nextConfig;
