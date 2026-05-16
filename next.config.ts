import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  // Allow .md and .mdx files to be treated as pages/components.
  pageExtensions: ["ts", "tsx", "md", "mdx"],
};

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    // Plugins must be passed as string specifiers (not imported functions),
    // because Next 16's Turbopack pipeline serializes loader options to
    // worker threads and rejects non-plain values.
    //
    // `remark-frontmatter` strips the `--- ... ---` YAML block so it doesn't
    // render as a literal paragraph at the top of each session. Frontmatter
    // is still consumed server-side by gray-matter in src/lib/content.ts
    // (for sidebar titles, ordering, etc.), so we don't need to expose it
    // as a JS export here.
    remarkPlugins: [["remark-frontmatter", ["yaml"]], ["remark-math"]],
    // KaTeX needs `strict: false` to forgive the small notation idiosyncrasies
    // that show up in textbook-style math (e.g. \begin{aligned} inside $$).
    rehypePlugins: [["rehype-katex", { strict: false, throwOnError: false }]],
  },
});

export default withMDX(nextConfig);
