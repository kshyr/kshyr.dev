import nextMDX from "@next/mdx";
import rehypeHighlight from "rehype-highlight";

/** @type {import('next').NextConfig} */
const nextConfig = {
    pageExtensions: ["ts", "tsx", "js", "jsx", "mdx"],
    experimental: {
        appDir: true,
    },
    images: {
        remotePatterns: [
            {hostname: "upload.wikimedia.org"},
            {hostname: "cdn.sanity.io"},
        ],
    },
    async rewrites() {
        return [{source: "/skills", destination: "/"}];
    },
};

export default nextMDX({
    options: {
        rehypePlugins: [rehypeHighlight],
    },
})(nextConfig);
