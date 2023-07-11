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
import { projects } from "../projects";
import NProgress from "nprogress";
import { useRouter } from "next/navigation";
export default function Page() {
  const router = useRouter();

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
            <TableHead>Type</TableHead>
            <TableHead className="text-right md:text-left">Tags</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => {
            return (
              <TableRow
                key={project.handle}
                className="cursor-pointer text-[16px]"
                onClick={() => {
                  NProgress.start();
                  router.push(`/${project.handle}`);
                }}
              >
                <TableCell className="py-5 font-semibold sm:pl-5">
                  {project.title}
                </TableCell>
                <TableCell className="text-[14px]">
                  {project.type.charAt(0).toUpperCase() +
                    project.type.substring(1)}
                  {project.subtype &&
                    ", " +
                    project.subtype.charAt(0).toUpperCase() +
                    project.subtype.substring(1)}
                </TableCell>
                <TableCell className="text-right text-[14px]  md:text-left">
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
