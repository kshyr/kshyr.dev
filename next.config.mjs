import nextMDX from "@next/mdx";
import { remarkCodeHike } from "@code-hike/mdx";
import theme from "shiki/themes/rose-pine.json" assert { type: "json" };

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "js", "jsx", "mdx"],
  experimental: {
    appDir: true,
  },
};

export default nextMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [[remarkCodeHike, { theme }]],
    rehypePlugins: [],
  },
})(nextConfig);
