import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["avatars.githubusercontent.com"],
    // alternatively, remotePatterns can be used for finer control
  },
};

export default nextConfig;
