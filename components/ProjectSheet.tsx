import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import ProjectCard from "./ProjectCard";
import type { Project } from "@/data/projects";

export default function ProjectModal({
  title,
  description,
  tags,
  bodyMarkdown,
}: Project) {
  return (
    <Sheet>
      <SheetTrigger>
        <ProjectCard title={title} description={description} tags={tags} />
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="text-4xl">{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
          {bodyMarkdown}
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}
