import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "assets.stockbit.com" },
      { protocol: "https", hostname: "assets.coincap.io" },
      { protocol: "https", hostname: "assets.ajaib.co.id" },
      { protocol: "https", hostname: "financialmodelingprep.com" },
    ],
  },
};

export default nextConfig;
