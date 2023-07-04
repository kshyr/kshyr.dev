import { Card, CardDescription, CardTitle, CardHeader } from "./ui/card";
import { Github, ScrollText } from "lucide-react";
import { Badge } from "./ui/badge";
import type { Project } from "@/lib/types";
import Link from "next/link";
import { cx } from "class-variance-authority";

export default function ProjectCard({
  handle,
  type,
  title,
  description,
  tags,
  variants,
  index,
  delay,
}: ProjectCardProps) {
  const fullAnimationTime = 0.6;
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
        delay: 0.25 + fullAnimationDelay,
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
        delayChildren: 0.4 + fullAnimationDelay,
        staggerChildren: 0.1,
      },
    },
  };

  const [animationDone, setAnimationDone] = useState(false);

  return (
    <Link href={"/" + handle} className="no-underline">
      <Card
        className={cx(
          "group flex w-96 border-transparent transition-colors hover:cursor-pointer hover:border-b-primary/10 hover:bg-secondary  hover:dark:border-b-border hover:dark:border-t-primary/10"
          //,"dark:border-l-border"
        )}
      >
        <CardHeader className="w-full gap-1">
          <div className="mb-1 flex h-4 w-full items-center justify-between">
            <CardTitle className="max-w-[16rem] text-left leading-tight">
              {title}
              {/* <span className="mt-0.5 block h-[1px] max-w-0 bg-foreground transition-all duration-500 group-hover:max-w-full"></span> */}
            </CardTitle>
            {type === "blog" ? (
              <ScrollText width={20} />
            ) : (
              <Github width={20} />
            )}
          </div>
          <CardDescription className="text-left">{description}</CardDescription>
          <div className="flex flex-wrap gap-2">
            {tags?.map((tag, i) => {
              return (
                <Badge
                  key={tag + i}
                  variant="secondary"
                  className="group-hover:border-primary/50"
                >
                  {tag}
                </Badge>
              );
            })}
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}
