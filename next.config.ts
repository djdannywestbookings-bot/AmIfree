import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Pin the workspace root so Next doesn't infer an unrelated lockfile
  // (e.g. ~/pnpm-lock.yaml) as the project root.
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
