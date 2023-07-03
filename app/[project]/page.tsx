import { projects } from "../projects";
export default function Page({ params }: { params: { project: string } }) {
  const project = projects.find((i) => i.handle === params.project);
  return (
    <div>
      My Post: {JSON.stringify(project)} {project?.bodyMarkdown}
    </div>
  );
}
