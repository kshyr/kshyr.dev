"use client";
import { serialize } from "next-mdx-remote/serialize";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { getBlogPost } from "@/sanity/lib/queries";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import rehypeHighlight from "rehype-highlight";

async function getMarkdown(url: string) {
  const data = await fetch(url).then((res) => res.text());
  return await serialize(data, {
    mdxOptions: {
      development: process.env.NODE_ENV === "development",
      rehypePlugins: [rehypeHighlight as any],
    },
  });
}

export default function ProjectPage({ slug }: { slug: string }) {
  //const project = projects.find((i) => i.slug === slug);
  const [project, setProject] = useState(null);
  const [mdxSource, setMdxSource] = useState<MDXRemoteSerializeResult | null>(
    null
  );

  useEffect(() => {
    getBlogPost(slug).then((res) => setProject(res));
  }, [slug]);

  useEffect(() => {
    if (project) {
      console.log(project);
      getMarkdown(project.markdownUrl).then((res) => setMdxSource(res));
    }
  }, [project]);

  if (!project || !mdxSource) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col justify-between gap-4 py-4"
    >
      <h1 className="text-3xl font-bold">{project?.title}</h1>
      <p className="max-w-lg text-muted-foreground">{project?.description}</p>

      {mdxSource && <MDXRemote {...mdxSource} />}
    </motion.div>
  );
}
