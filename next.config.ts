import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
    basePath : '/nps',
    assetPrefix : '/nps',
    trailingSlash: true,
    images: {
      unoptimized: true
    }
};

export default nextConfig;
