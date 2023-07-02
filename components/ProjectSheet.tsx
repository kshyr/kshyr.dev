import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import ProjectCard from "./ProjectCard";
import type { Project } from "@/lib/types";

export default function ProjectSheet({
  type,
  title,
  description,
  tags,
  bodyMarkdown,
}: Project) {
  return (
    <Sheet>
      <SheetTrigger>
        <ProjectCard
          type={type}
          title={title}
          description={description}
          tags={tags}
        />
      </SheetTrigger>
      <SheetContent className="overflow-y-auto overflow-x-hidden">
        <SheetHeader>
          <SheetTitle className="text-4xl">{title}</SheetTitle>
          <SheetDescription className="pb-4">{description}</SheetDescription>
          {bodyMarkdown}
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}
