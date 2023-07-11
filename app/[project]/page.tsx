"use client";
import { projects } from "../projects";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useLastVisited } from "@/lib/hooks/useLastVisited";

export default function Page({ params }: { params: { project: string } }) {
  const pathname = usePathname();
  const { isEvaluated, animReady } = useLastVisited(pathname);
  const project = projects.find((i) => i.handle === params.project);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col justify-between gap-4 py-4"
    >
      <h1 className="text-3xl font-bold">{project?.title}</h1>
      <p className="mb-4 max-w-lg text-muted-foreground">
        {project?.description}
      </p>

      {project?.bodyMarkdown}
    </motion.div>
  );
}
