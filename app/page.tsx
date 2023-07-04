"use client";
import { projects } from "./projects";
import ProjectCard from "@/components/ProjectCard";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-row justify-between py-4"
    >
      <section className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold  text-muted-foreground">
          Frontend Engineer
        </h2>
        <h1 className="font-display text-[2.5rem] font-bold leading-[2.75rem] tracking-tight">
          Kostiantyn Shyrolapov
        </h1>
        <p className="text-md mt-6 max-w-sm text-muted-foreground">
          Lorem ipsum dolor sit amet, officia excepteur ex fugiat reprehenderit
          enim labore culpa sint ad nisi Lorem pariatur mollit ex esse
          exercitation amet. Nisi anim cupidatat excepteur officia.
          Reprehenderit nostrud nostrud ipsum Lorem est aliquip amet voluptate
          voluptate dolor minim nulla est proident. Nostrud officia pariatur ut
          officia.
        </p>
      </section>
      <section className="flex flex-col gap-4">
        {projects.map((project) => {
          return (
            <ProjectCard
              key={project.title}
              handle={project.handle}
              type={project.type}
              title={project.title}
              description={project.description}
              tags={project.tags}
            />
          );
        })}
      </section>
    </motion.main>
  );
}
