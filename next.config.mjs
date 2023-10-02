import nextMDX from "@next/mdx";
import rehypeHighlight from "rehype-highlight";

/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        ignoreBuildErrors: true,
    },
    pageExtensions: ["ts", "tsx", "js", "jsx", "mdx"],
    images: {
        remotePatterns: [
            {hostname: "upload.wikimedia.org"},
            {hostname: "cdn.sanity.io"},
        ],
    },
};

export default nextMDX({
    options: {
        rehypePlugins: [rehypeHighlight],
    },
})(nextConfig);
