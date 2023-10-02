import ClientSideProjectsPage from "@/components/csr-pages/Projects";
import { Metadata } from "next";
import { getProjects } from "@/sanity/lib/queries";

export const metadata: Metadata = {
  title: "Blog",
  description: "A list of my projects.",
};

export default async function ProjectsPage() {
  const projects = await getProjects();
  return <ClientSideProjectsPage projects={projects} />;
}
