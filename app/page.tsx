"use client";
import { projects } from "./projects";
import ProjectCard from "@/components/ProjectCard";
import { Variants, motion } from "framer-motion";
import { useLastVisited } from "@/lib/hooks/useLastVisited";
import { usePathname } from "next/navigation";

const nameVariants: Variants = {
  initial: {
    opacity: 0,
    x: -60,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      delay: 0,
    },
  },
};

const titleVariants: Variants = {
  initial: {
    opacity: 0,
    y: -40,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      delay: 0.3,
    },
  },
};

const introVariants: Variants = {
  initial: {
    opacity: 0,
    y: 40,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: 0.8,
    },
  },
};

const projectsSectionDelay = 1.2;

const projectsVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      delay: projectsSectionDelay,
      staggerChildren: 0.2,
    },
  },
};

export default function Home() {
  const pathname = usePathname();
  const { animReady } = useLastVisited(pathname);

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-row justify-between py-4"
    >
      <section className="flex flex-col gap-1">
        <motion.h2
          variants={animReady ? titleVariants : undefined}
          initial="initial"
          animate="animate"
          className="text-xl font-semibold  text-muted-foreground"
        >
          Frontend Engineer
        </motion.h2>
        <motion.h1
          variants={animReady ? nameVariants : undefined}
          initial="initial"
          animate="animate"
          className="font-display text-[2.5rem] font-bold leading-[2.75rem] tracking-tight"
        >
          Kostiantyn Shyrolapov
        </motion.h1>
        <motion.p
          variants={animReady ? introVariants : undefined}
          initial="initial"
          animate="animate"
          className="text-md mt-6 max-w-sm text-muted-foreground"
        >
          Lorem ipsum dolor sit amet, officia excepteur ex fugiat reprehenderit
          enim labore culpa sint ad nisi Lorem pariatur mollit ex esse
          exercitation amet. Nisi anim cupidatat excepteur officia.
          Reprehenderit nostrud nostrud ipsum Lorem est aliquip amet voluptate
          voluptate dolor minim nulla est proident. Nostrud officia pariatur ut
          officia.
        </motion.p>
      </section>
      <motion.section
        variants={animReady ? projectsVariants : undefined}
        initial="initial"
        animate="animate"
        className="flex flex-col gap-4"
      >
        {projects.map((project, i) => {
          return (
            <ProjectCard
              key={project.title}
              handle={project.handle}
              type={project.type}
              title={project.title}
              description={project.description}
              tags={project.tags}
              variants={projectsVariants}
              index={i}
              delay={projectsSectionDelay}
            />
          );
        })}
      </motion.section>
    </motion.main>
  );
}
