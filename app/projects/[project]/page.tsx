import { getProject } from "@/sanity/lib/queries";
import ClientSideProjectPage from "@/components/csr-pages/ProjectPage";
import { Metadata } from "next";
import { getMarkdown } from "@/lib/utils";

export const revalidate = 60;

type Props = {
  params: { project: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = params.project;
  const project = await getProject(slug);
  return {
    title: project.title,
    description: project.description,
    keywords: project.tags,
  };
}

export default async function ProjectPage({ params }: Props) {
  const slug = params.project;
  const project = await getProject(slug);
  const mdxSource = await getMarkdown(project.markdownUrl);
  return <ClientSideProjectPage project={project} mdxSource={mdxSource} />;
}
