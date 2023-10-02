"use client";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { motion } from "framer-motion";
import NProgress from "nprogress";
import { useRouter } from "next/navigation";
import { Project } from "@/lib/types";

export default function ProjectsPage({ projects }: { projects: Project[] }) {
  const router = useRouter();

  if (!projects) {
    return null;
  } else {
    NProgress.done();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="py-4"
    >
      <Table>
        <TableCaption>A list of my projects.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="sm:pl-5">Title</TableHead>
            <TableHead className="text-right">Tags</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => {
            return (
              <TableRow
                key={project.slug}
                className="cursor-pointer text-[16px]"
                onClick={() => {
                  NProgress.start();
                  NProgress.remove();
                  router.push(`projects/${project.slug}`);
                }}
              >
                <TableCell className="py-5 font-semibold sm:pl-5">
                  {project.title}
                </TableCell>

                <TableCell className="text-right text-[14px]">
                  {project.tags?.join(", ")}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </motion.div>
  );
}
