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
import Link from "next/link";
export default function Page() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-row justify-between py-4"
    >
      <Table>
        <TableCaption>A list of my projects.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>Link</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => {
            return (
              <TableRow key={project.handle} className="text-[16px]">
                <TableCell className="py-5 font-medium">
                  {project.title}
                </TableCell>
                <TableCell>
                  {project.type.charAt(0).toUpperCase() +
                    project.type.substring(1)}
                </TableCell>
                <TableCell>{project.tags?.join(", ")}</TableCell>
                <TableCell>
                  <Link href={"/" + project.handle}>/{project.handle}</Link>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </motion.div>
  );
}
