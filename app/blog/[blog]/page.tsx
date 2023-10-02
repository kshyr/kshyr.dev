import { getBlogPost } from "@/sanity/lib/queries";
import ClientSideBlogPostPage from "@/components/csr-pages/BlogPostPage";
import { Metadata } from "next";

type Props = {
  params: { blog: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = params.blog;
  const blog = await getBlogPost(slug);

  return {
    title: blog.title,
    description: blog.description,
    keywords: blog.tags,
  };
}

export default function ProjectPage({ params }: Props) {
  return <ClientSideBlogPostPage slug={params.blog} />;
}
