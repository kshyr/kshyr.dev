import ClientSideBlogPage from "@/components/csr-pages/Blog";
import { Metadata } from "next";
import { getBlogPosts } from "@/sanity/lib/queries";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog",
  description: "A list of my blog posts.",
};

export default async function ProjectsPage() {
  const posts = await getBlogPosts();
  return <ClientSideBlogPage posts={posts} />;
}
