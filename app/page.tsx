"use client";
import { projects } from "./projects";
import ProjectCard from "@/components/ProjectCard";
import { Variants, motion } from "framer-motion";
import { useLastVisited } from "@/lib/hooks/useLastVisited";
import { usePathname } from "next/navigation";
import Name from "@/components/interactive-words/Name";
import { ArrowRight } from "lucide-react";
import { Memorable } from "@/components/interactive-words/Memorable";
import { Accessible } from "@/components/interactive-words/Accessible";
import { skills } from "@/app/skills";
import { cn } from "@/lib/utils";
import SkillTag from "@/components/Skills";
import { Skill } from "./skills";
import Link from "next/link";

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
      staggerChildren: 0.1,
    },
  },
};

const skillVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      delayChildren: projectsSectionDelay,
      staggerChildren: 0.15,
    },
  },
};

const featuredHandles = ["ui-crates", "digital-garden", "linkstash", "vec"];

export default function Home() {
  const pathname = usePathname();
  const { isEvaluated, animReady } = useLastVisited(pathname);

  if (!isEvaluated) return null;

  function highlight(text: string) {
    return (
      <strong className="underline decoration-transparent transition-colors hover:text-foreground hover:decoration-primary">
        {text}
      </strong>
    );
  }
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col justify-between py-4 lg:flex-row"
    >
      <div className="flex flex-col gap-8">
        <section className="flex flex-col items-center gap-1 lg:items-start">
          <motion.h2
            variants={animReady ? titleVariants : undefined}
            initial="initial"
            animate="animate"
            className="text-[15px] font-semibold text-muted-foreground sm:text-xl"
          >
            Frontend Engineer{" "}
            <em className="text-sm text-muted-foreground/80">@ Stealth</em>
          </motion.h2>
          <motion.h1
            variants={animReady ? nameVariants : undefined}
            initial="initial"
            animate="animate"
            className="whitespace-nowrap font-display text-3xl font-bold leading-4 tracking-tight sm:text-[2.5rem] sm:leading-[2.75rem]"
          >
            <Name />
          </motion.h1>
          <motion.div
            variants={animReady ? introVariants : undefined}
            initial="initial"
            animate="animate"
            className="text-md mt-6 max-w-md cursor-default text-center text-muted-foreground lg:max-w-sm lg:text-left"
          >
            <p>
              I specialize in {/* <Link */}
              {/*   href="/library" */}
              {/*   className="text-muted-foreground dark:text-muted-foreground" */}
              {/* > */}
              {highlight("web development")} {/* </Link>{" "} */}
              - bringing designs and ideas to life, and always doing my best to
              make experience both <Accessible /> and <Memorable /> to the end
              user.
            </p>
            <p className="mt-6">
              I&apos;m also passionate about other areas of software, such as
              embedded engineering, game development, and I&apos;m actively
              learning about low-level programming to apply my computer science
              knowledge where performance is critical.
            </p>
          </motion.div>
        </section>
        <section className="flex flex-col items-center gap-1 lg:items-start">
          {/* <span className="text-xs italic text-muted-foreground"> */}
          {/*   Click tag to open projects */}
          {/* </span> */}
          <motion.div
            variants={animReady ? skillVariants : undefined}
            initial="initial"
            animate="animate"
            className="flex max-w-sm flex-wrap justify-center gap-1 lg:justify-start"
          >
            {skills.map((skill: Skill) => {
              return (
                <SkillTag
                  skill={skill}
                  skillVariants={skillVariants}
                  key={skill.name}
                />
              );
            })}
          </motion.div>
        </section>
      </div>
      <motion.section
        variants={animReady ? projectsVariants : undefined}
        initial="initial"
        animate="animate"
        className="mt-16 flex flex-col items-center gap-4 lg:mt-0 lg:items-start"
      >
        {projects
          .filter((p) => featuredHandles.includes(p.handle))
          .map((project, i) => {
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
                animReady={animReady}
              />
            );
          })}
        <Link
          href="/library"
          className={cn(
            "flex select-none items-center gap-2 self-center rounded-md border border-transparent px-4 py-2 font-display font-normal text-foreground no-underline shadow transition-colors  lg:self-end",
            "hover:border-b-primary/10 hover:bg-secondary hover:text-foreground/80 dark:text-foreground hover:dark:border-b-border hover:dark:border-t-primary/10 hover:dark:text-foreground/80 active:dark:bg-secondary/70"
          )}
        >
          See more <ArrowRight size={18} />
        </Link>
      </motion.section>
    </motion.main>
  );
}
