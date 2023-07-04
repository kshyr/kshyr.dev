"use client";
import { Project } from "@/lib/types";
import { projects, getREADME } from "../projects";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useLastVisited } from "@/lib/hooks/useLastVisited";

// @ts-expect-error
async function getMarkdown(project: Project) {
  if (project.bodyMarkdown) {
    return project.bodyMarkdown;
  }
  const markdown = await getREADME(project.handle);

  return markdown;
}

export default function Page({ params }: { params: { project: string } }) {
  const pathname = usePathname();
  const { animReady } = useLastVisited(pathname);
  const project = projects.find((i) => i.handle === params.project);
  const markdown = getMarkdown(project as Project);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      My Post: {JSON.stringify(project)}
    </motion.div>
  );
}
