import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // exifr picks its Node file reader with a runtime `require`, which the
  // bundler cannot follow; leave it as a plain Node module.
  serverExternalPackages: ["exifr"],
  images: {
    // AVIF first, WebP for browsers without it. Next picks from the Accept
    // header. See docs/adr/0005-images-and-performance-budgets.md.
    formats: ["image/avif", "image/webp"],
    // Required list in Next 16. One quality keeps the cache small; add a
    // second only if a photograph needs it.
    qualities: [75],
  },
};

// Bodies in content/ are compiled when they are imported; the frontmatter is
// read by src/lib/content and only stripped here. Turbopack takes plugins by
// name. See docs/adr/0008-atomic-content-model.md.
const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
  options: { remarkPlugins: ["remark-frontmatter"] },
});

export default withMDX(nextConfig);
