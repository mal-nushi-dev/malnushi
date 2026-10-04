import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // AVIF first, WebP for browsers without it. Next picks from the Accept
    // header. See docs/adr/0005-images-and-performance-budgets.md.
    formats: ["image/avif", "image/webp"],
    // Required list in Next 16. One quality keeps the cache small; add a
    // second only if a photograph needs it.
    qualities: [75],
  },
};

export default nextConfig;
