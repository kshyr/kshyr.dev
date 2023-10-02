import { getProject } from "@/sanity/lib/queries";
import ClientSideProjectPage from "@/components/csr-pages/ProjectPage";
import { Metadata } from "next";

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

export default function ProjectPage({ params }: Props) {
  return <ClientSideProjectPage slug={params.project} />;
}
