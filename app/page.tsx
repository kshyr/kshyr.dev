import ProjectSheet from "@/components/ProjectSheet";
import ThemeSwitch from "@/components/ThemeSwitch";
import { projects } from "./projects";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center gap-8 p-24">
      <ThemeSwitch />
      <section className="flex flex-col gap-4">
        {projects.map((project) => {
          return (
            <ProjectSheet
              type={project.type}
              key={project.title}
              title={project.title}
              description={project.description}
              tags={project.tags}
              bodyMarkdown={project.bodyMarkdown}
            />
          );
        })}
      </section>
    </main>
  );
}
