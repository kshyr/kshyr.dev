import ProjectSheet from "@/components/ProjectSheet";
import ThemeSwitch from "@/components/ThemeSwitch";
import { projects } from "./projects";
import ProjectCard from "@/components/ProjectCard";

/* <main className="flex min-h-screen flex-col items-center gap-8 p-24"> */
export default function Home() {
  return (
    <section className="flex flex-col gap-4">
      {projects.map((project) => {
        return (
          <ProjectCard
            key={project.title}
            handle={project.handle}
            type={project.type}
            title={project.title}
            description={project.description}
            tags={project.tags}
          />
        );
      })}
    </section>
  );
}
