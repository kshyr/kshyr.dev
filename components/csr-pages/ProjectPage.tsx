"use client";
import { serialize } from "next-mdx-remote/serialize";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { getProject } from "@/sanity/lib/queries";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import rehypeHighlight from "rehype-highlight";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github } from "lucide-react";

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
    getProject(slug).then((res) => setProject(res));
  }, [slug]);

  useEffect(() => {
    if (project) {
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
      <h1 className="text-3xl font-bold">{project.title}</h1>
      <p className="max-w-lg text-muted-foreground">{project.description}</p>
      <div className="mb-4 flex gap-2 ">
        <a
          href={project.githubUrl}
          target="_blank"
          className="text-foreground dark:text-foreground"
        >
          <Button variant="outline" className="text-md gap-2">
            <Github size={20} />
            Github
          </Button>
        </a>
        <a
          href={project.liveUrl}
          target="_blank"
          className="text-foreground dark:text-foreground"
        >
          <Button variant="outline" className="text-md gap-2">
            <ExternalLink size={20} />
            Live
          </Button>
        </a>
      </div>
      {mdxSource && <MDXRemote {...mdxSource} />}
    </motion.div>
  );
}
