"use client";
import { Card, CardDescription, CardTitle, CardHeader } from "./ui/card";
import { Github, ScrollText } from "lucide-react";
import { Badge } from "./ui/badge";
import type { Project } from "@/lib/types";
import Link from "next/link";
import { cx } from "class-variance-authority";
import { Variants, motion } from "framer-motion";
import { useState } from "react";
import { useLastVisited } from "@/lib/hooks/useLastVisited";
import { usePathname } from "next/navigation";

interface MotionProps {
  variants: Variants;
  index: number;
  delay: number;
  animReady: boolean;
}

type ProjectCardProps = Partial<Project> & MotionProps;

export default function ProjectCard({
  handle,
  type,
  title,
  description,
  tags,
  variants,
  index,
  delay,
  animReady,
}: ProjectCardProps) {
  const [animationDone, setAnimationDone] = useState(false);
  const pathname = usePathname();

  const fullAnimationTime = 0.55;
  const fullAnimationDelay = delay + fullAnimationTime * index;

  const titleVariants: Variants = {
    initial: {
      opacity: 0,
    },
    animate: {
      opacity: 1,
      transition: {
        delay: fullAnimationDelay,
      },
    },
  };

  const descriptionVariants: Variants = {
    initial: {
      opacity: 0,
    },
    animate: {
      opacity: 1,
      transition: {
        delay: 0.1 + fullAnimationDelay,
      },
    },
  };

  const badgeVariants: Variants = {
    initial: {
      opacity: 0,
    },
    animate: {
      opacity: 1,
      transition: {
        delayChildren: 0.15 + fullAnimationDelay,
        staggerChildren: 0.08,
      },
    },
  };

  return (
    <Link
      href={animationDone ? `/${handle}` : ""}
      className={cx("no-underline", animationDone || "cursor-default")}
      draggable={false}
    >
      <Card
        variants={animReady ? (variants as Variants) : undefined}
        className={cx(
          "group flex w-96 select-none border-transparent transition-colors",
          animationDone &&
          "shadow hover:border-b-primary/10 hover:bg-secondary hover:dark:border-b-border hover:dark:border-t-primary/10 active:dark:bg-secondary/70",
          animationDone ? "shadow" : "shadow-none"
        )}
      >
        <CardHeader className="w-full gap-1">
          <motion.div
            variants={animReady ? titleVariants : undefined}
            initial="initial"
            animate="animate"
            className="mb-1 flex h-4 w-full items-center justify-between"
          >
            <CardTitle className="max-w-[16rem] text-left leading-tight">
              {title}
            </CardTitle>
            {type === "blog" ? (
              <ScrollText width={20} />
            ) : (
              <Github width={20} />
            )}
          </motion.div>
          <CardDescription
            variants={animReady ? descriptionVariants : undefined}
            animate="animate"
            initial="initial"
            className="text-left"
            onAnimationComplete={() => setAnimationDone(true)}
          >
            {description}
          </CardDescription>
          <motion.div
            className="flex flex-wrap gap-2"
            variants={animReady ? badgeVariants : undefined}
            initial="initial"
            animate="animate"
          >
            {tags?.map((tag, i) => {
              return (
                <Badge
                  key={tag + i}
                  variants={animReady ? badgeVariants : undefined}
                  variant="secondary"
                  className="group-hover:border-primary/50"
                >
                  {tag}
                </Badge>
              );
            })}
          </motion.div>
        </CardHeader>
      </Card>
    </Link>
  );
}
