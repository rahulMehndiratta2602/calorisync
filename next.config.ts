import type { NextConfig } from "next";
import path from "node:path";

const root = path.resolve(__dirname);

const nextConfig: NextConfig = {
  // Explicitly pin the workspace root so the parent repo's lockfile doesn't
  // hijack env loading or trace resolution when running inside a git worktree.
  turbopack: { root },
  outputFileTracingRoot: root,
  // Use standalone build mode for deployable single-file output.
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "calorisync.com" },
      { protocol: "https", hostname: "**.cloudfront.net" },
      { protocol: "https", hostname: "**.s3.amazonaws.com" },
    ],
  },
  experimental: {
    // Allow lib imports as server-only by default; opt-in to bundling.
    serverActions: { bodySizeLimit: "10mb" },
  },
};

export default nextConfig;
