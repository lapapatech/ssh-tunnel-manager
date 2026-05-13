import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  serverExternalPackages: ["ssh2"],
  allowedDevOrigins: [
    "space-z.ai",
    "10.10.10.50",
    "10.10.10.180",
  ],
};

export default nextConfig;
