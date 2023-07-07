"use client";
import { projects, getREADME } from "../projects";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useLastVisited } from "@/lib/hooks/useLastVisited";

export default function Page({ params }: { params: { project: string } }) {
  const pathname = usePathname();
  const { animReady } = useLastVisited(pathname);
  const project = projects.find((i) => i.handle === params.project);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col justify-between py-4"
    >
      <h1>{project?.title}</h1>
      <p>{project?.description}</p>

      {project?.bodyMarkdown}
    </motion.div>
  );
}
