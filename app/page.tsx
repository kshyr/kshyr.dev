"use client";
import { projects } from "./projects";
import ProjectCard from "@/components/ProjectCard";
import { Variants, motion } from "framer-motion";
import { useLastVisited } from "@/lib/hooks/useLastVisited";
import { usePathname } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Name from "@/components/Name";
import { Memorable } from "@/components/Memorable";

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
      className="flex flex-col justify-between py-4 lg:flex-row"
    >
      <section className="flex flex-col items-center gap-1 lg:items-start">
        <motion.h2
          variants={animReady ? titleVariants : undefined}
          initial="initial"
          animate="animate"
          className="text-xl font-semibold text-muted-foreground"
        >
          Frontend Engineer{" "}
          <em className="text-sm text-muted-foreground/80">@ Stealth</em>
        </motion.h2>
        <motion.h1
          variants={animReady ? nameVariants : undefined}
          initial="initial"
          animate="animate"
          className="whitespace-nowrap font-display text-[2.5rem] font-bold leading-[2.75rem] tracking-tight"
        >
          <Name />
        </motion.h1>
        <motion.p
          variants={animReady ? introVariants : undefined}
          initial="initial"
          animate="animate"
          className="text-md mt-6 max-w-md cursor-default text-muted-foreground lg:max-w-sm"
        >
          I specialize in{" "}
          <strong className="cursor-pointer underline decoration-transparent transition-colors hover:text-foreground hover:decoration-primary">
            web development
          </strong>{" "}
          - bringing designs and ideas to life, and always doing my best to make
          experience both{" "}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="cursor-help select-none lg:select-text">
                <strong className="transition-colors hover:text-foreground">
                  accessible
                </strong>
              </TooltipTrigger>
              <TooltipContent className="font-mono">
                {"<"}
                <b>strong</b>
                {"> "}
                <b>accessible</b>

                {" </"}
                <b>strong</b>
                {">"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>{" "}
          and <Memorable /> to the end user.
        </motion.p>
      </section>
      <motion.section
        variants={animReady ? projectsVariants : undefined}
        initial="initial"
        animate="animate"
        className="mt-16 flex flex-col items-center gap-4 lg:mt-0 lg:items-start"
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
