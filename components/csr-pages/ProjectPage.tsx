"use client";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github } from "lucide-react";
import NProgress from "nprogress";
import { Project } from "@/lib/types";

export default function ProjectPage({
  project,
  mdxSource,
}: {
  project: Project;
  mdxSource: MDXRemoteSerializeResult;
}) {
  if (!project || !mdxSource) {
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
      <h1 className="text-3xl font-bold">{project.title}</h1>
      <p className="max-w-lg text-muted-foreground">{project.description}</p>
      <div className="mb-4 flex gap-2 ">
        {project.githubUrl && (
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
        )}
        {project.liveUrl && (
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
        )}
      </div>
      {mdxSource && <MDXRemote {...mdxSource} />}
    </motion.div>
  );
}
