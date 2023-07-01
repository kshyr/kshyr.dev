import Image from "next/image";
import { Card, CardDescription, CardTitle, CardHeader } from "./ui/card";
import { Github } from "lucide-react";
import { Badge } from "./ui/badge";
import type { Project } from "@/data/projects";

type ProjectCardProps = {
  title: Project["title"];
  description: Project["description"];
  tags: Project["tags"];
  previewUrl?: Project["previewUrl"];
};

export default function ProjectCard({
  title,
  description,
  tags,
}: ProjectCardProps) {
  return (
    <Card className="group flex max-w-md border-transparent transition-colors hover:cursor-pointer hover:border-b-primary/10 hover:bg-secondary hover:dark:border-b-border hover:dark:border-t-primary/10">
      <Github size={96} className="ml-6 mt-3" />
      <CardHeader className="gap-1">
        <CardTitle className="max-w-fit">
          {title}
          {/* <span className="mt-0.5 block h-[1px] max-w-0 bg-foreground transition-all duration-500 group-hover:max-w-full"></span> */}
        </CardTitle>
        <CardDescription className="text-left">{description}</CardDescription>
        <div className="flex gap-2">
          {tags?.map((tag, i) => {
            return (
              <Badge
                key={tag + i}
                variant="secondary"
                className="mt-1 group-hover:border-primary/50"
              >
                {tag}
              </Badge>
            );
          })}
        </div>
      </CardHeader>
    </Card>
  );
}
