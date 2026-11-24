import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "decimal.js",
      "date-fns",
    ],
  },
  images: {
    localPatterns: [
      {
        pathname: "/**",
        search: "?*",
      },
      {
        pathname: "/**",
        search: "*",
      },
      {
        pathname: "/**",
      },
    ],
    remotePatterns: [
      { protocol: "https", hostname: "assets.stockbit.com" },
      { protocol: "https", hostname: "assets.coincap.io" },
      { protocol: "https", hostname: "assets.ajaib.co.id" },
      { protocol: "https", hostname: "financialmodelingprep.com" },
    ],
  },
};

export default nextConfig;
