"use client";
import { serialize } from "next-mdx-remote/serialize";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { getBlogPost } from "@/sanity/lib/queries";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import rehypeHighlight from "rehype-highlight";
import { Button } from "@/components/ui/button";
import Image from "next/image";

async function getMarkdown(url: string) {
  const data = await fetch(url).then((res) => res.text());
  return await serialize(data, {
    mdxOptions: {
      development: process.env.NODE_ENV === "development",
      rehypePlugins: [rehypeHighlight as any],
    },
  });
}

export default function BlogPostPage({ slug }: { slug: string }) {
  //const project = projects.find((i) => i.slug === slug);
  const [post, setPost] = useState(null);
  const [mdxSource, setMdxSource] = useState<MDXRemoteSerializeResult | null>(
    null
  );

  useEffect(() => {
    getBlogPost(slug).then((res) => setPost(res));
  }, [slug]);

  useEffect(() => {
    if (post) {
      getMarkdown(post.markdownUrl).then((res) => setMdxSource(res));
    }
  }, [post]);

  if (!post || !mdxSource) {
    return null;
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
