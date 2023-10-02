import { getProject } from "@/sanity/lib/queries";
import ClientSideProjectPage from "@/components/csr-pages/ProjectPage";
import { Metadata } from "next";
import { serialize } from "next-mdx-remote/serialize";
import rehypeHighlight from "rehype-highlight";

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

async function getMarkdown(url: string) {
  const data = await fetch(url).then((res) => res.text());
  return await serialize(data, {
    mdxOptions: {
      development: process.env.NODE_ENV === "development",
      rehypePlugins: [rehypeHighlight as any],
    },
  });
}

export default async function ProjectPage({ params }: Props) {
  const slug = params.project;
  const project = await getProject(slug);
  const mdxSource = await getMarkdown(project.markdownUrl);
  return <ClientSideProjectPage project={project} mdxSource={mdxSource} />;
}
