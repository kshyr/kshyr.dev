import ProjectCard from "@/components/ProjectCard";
import ProjectSheet from "@/components/ProjectSheet";
import ThemeSwitch from "@/components/ThemeSwitch";
import Hello from "./markdowns/hello.mdx";
import { Project } from "@/data/projects";
import type { MDXComponents } from "mdx/types";

const projects: Project[] = [
  {
    title: "Project title",
    description:
      "Lorem ipsum dolor sit amet, qui minim labore adipisicing minim sint cillum sint consectetur cupidatat.",
    tags: ["TypeScript", "React"],
    bodyMarkdown: <Hello />,
  },
];
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center gap-8 p-24">
      <ThemeSwitch />
      {projects.map((project) => {
        return (
          <ProjectSheet
            key={project.title}
            title={project.title}
            description={project.description}
            bodyMarkdown={project.bodyMarkdown}
          />
        );
      })}
    </main>
  );
}
