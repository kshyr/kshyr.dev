import { Project } from "@/lib/types";
import { projects, getREADME } from "../projects";

// @ts-expect-error
async function getMarkdown(project: Project) {
  if (project.bodyMarkdown) {
    return project.bodyMarkdown;
  }
  const markdown = await getREADME(project.handle);

  return markdown;
}

export default async function Page({
  params,
}: {
  params: { project: string };
}) {
  const project = projects.find((i) => i.handle === params.project);
  const markdown = getMarkdown(project as Project);

  return (
    <div>
      My Post: {JSON.stringify(project)} {markdown}
    </div>
  );
}
