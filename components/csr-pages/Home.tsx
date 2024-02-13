"use client";
import ProjectCard from "@/components/ProjectCard";
import { motion } from "framer-motion";
//@ts-ignore
import { usePathname } from "next/navigation";
import Name from "@/components/interactive-words/Name";
import { ArrowRight } from "lucide-react";
import { Memorable } from "@/components/interactive-words/Memorable";
import { Accessible } from "@/components/interactive-words/Accessible";
import { Skill, skills } from "@/app/skills";
import { cn } from "@/lib/utils";
import SkillTag from "@/components/Skills";
import Link from "next/link";
import { BlogPost, Project } from "@/lib/types";
import {
  dividerVariants,
  introVariants,
  nameVariants,
  postsMoreVariants,
  projectsMoreVariants,
  projectsSectionDelay,
  projectsVariants,
  skillVariants,
  titleVariants,
} from "@/lib/data/motion-variants/HomeVariants";
import { useLastVisited } from "@/lib/hooks/useLastVisited";

export default function Home({
  featured,
}: {
  featured: {
    projects: Project[];
    posts: BlogPost[];
  };
}) {
  const pathname = usePathname();
  const { isEvaluated, animReady } = useLastVisited(pathname);

  if (!isEvaluated || !featured) return null;

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
            <em className="text-sm text-muted-foreground/80">@ FORA</em>
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
        {featured.projects.map((project, i) => {
          return (
            <ProjectCard
              key={project.slug}
              slug={project.slug}
              type="project"
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
        <motion.div
          variants={animReady ? projectsMoreVariants : undefined}
          initial="initial"
          animate="animate"
          className="self-center lg:self-end"
        >
          <Link
            href="/projects"
            className={cn(
              "flex select-none items-center gap-2 rounded-md border border-transparent px-4 py-2 font-display font-normal text-foreground no-underline shadow transition-colors",
              "hover:border-b-primary/10 hover:bg-secondary hover:text-foreground/80 dark:text-foreground hover:dark:border-b-border hover:dark:border-t-primary/10 hover:dark:text-foreground/80 active:dark:bg-secondary/70"
            )}
          >
            See more projects <ArrowRight size={18} />
          </Link>
        </motion.div>
        <motion.div
          variants={animReady ? dividerVariants : undefined}
          initial="initial"
          animate="animate"
          className="h-[1px] w-full self-end bg-muted-foreground"
        />
        {featured.posts.map((project, i) => {
          return (
            <ProjectCard
              key={project.slug}
              slug={project.slug}
              type="blog"
              title={project.title}
              description={project.description}
              tags={project.tags}
              variants={projectsVariants}
              index={i + 3}
              delay={projectsSectionDelay}
              animReady={animReady}
            />
          );
        })}
        <motion.div
          variants={animReady ? postsMoreVariants : undefined}
          initial="initial"
          animate="animate"
          className="self-center lg:self-end"
        >
          <Link
            href="/blog"
            className={cn(
              "flex select-none items-center gap-2  rounded-md border border-transparent px-4 py-2 font-display font-normal text-foreground no-underline shadow transition-colors",
              "hover:border-b-primary/10 hover:bg-secondary hover:text-foreground/80 dark:text-foreground hover:dark:border-b-border hover:dark:border-t-primary/10 hover:dark:text-foreground/80 active:dark:bg-secondary/70"
            )}
          >
            See more posts <ArrowRight size={18} />
          </Link>
        </motion.div>
      </motion.section>
    </motion.main>
  );
}
