"use client";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import NProgress from "nprogress";
import { BlogPost } from "@/lib/types";

export default function BlogPostPage({
  post,
  mdxSource,
}: {
  post: BlogPost;
  mdxSource: MDXRemoteSerializeResult;
}) {
  if (!post || !mdxSource) {
    return null;
  } else {
    NProgress.done();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col justify-between gap-4 py-4"
    >
      <h1 className="text-3xl font-bold">{post.title}</h1>
      <p className="max-w-lg text-muted-foreground">{post.description}</p>
      <div className="mb-4 flex gap-2 ">
        <a
          href={post.devtoUrl}
          key={post.devtoUrl}
          target="_blank"
          className="text-foreground dark:text-foreground"
        >
          <Button variant="outline" className="text-md gap-2">
            <Image
              src="/dev-to.svg"
              width={22}
              height={22}
              className="m-0 border-none invert-0 dark:invert"
              alt="dev.to logo"
            />
            dev.to
          </Button>
        </a>
      </div>
      {mdxSource && <MDXRemote {...mdxSource} />}
    </motion.div>
  );
}
