"use client";
import { projects } from "../projects";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useLastVisited } from "@/lib/hooks/useLastVisited";
import { Button } from "@/components/ui/button";

export default function Page({ params }: { params: { project: string } }) {
  const pathname = usePathname();
  const { isEvaluated, animReady } = useLastVisited(pathname);
  const project = projects.find((i) => i.handle === params.project);

  if (!isEvaluated) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col justify-between gap-4 py-4"
    >
      <h1 className="text-3xl font-bold">{project?.title}</h1>
      <p className="max-w-lg text-muted-foreground">{project?.description}</p>
      <div className="mb-4 flex gap-2 ">
        {project?.links?.map((link) => {
          return (
            <a
              href={link.url}
              key={link.url}
              target="_blank"
              className="text-foreground dark:text-foreground"
            >
              <Button variant="outline" className="text-md gap-2">
                {link.icon} {link.title}
              </Button>
            </a>
          );
        })}
      </div>

      {project?.bodyMarkdown}
    </motion.div>
  );
}
