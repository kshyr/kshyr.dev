import { getBlogPost } from "@/sanity/lib/queries";
import ClientSideBlogPostPage from "@/components/csr-pages/BlogPostPage";
import { Metadata } from "next";
import { getMarkdown } from "@/lib/utils";

export const revalidate = 60;

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

export default async function BlogPostPage({ params }: Props) {
  const slug = params.blog;
  const post = await getBlogPost(slug);
  const mdxSource = await getMarkdown(post.markdownUrl);
  return <ClientSideBlogPostPage post={post} mdxSource={mdxSource} />;
}
