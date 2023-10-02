import { getBlogPost } from "@/sanity/lib/queries";
import ClientSideBlogPostPage from "@/components/csr-pages/BlogPostPage";
import { Metadata } from "next";
import { serialize } from "next-mdx-remote/serialize";
import rehypeHighlight from "rehype-highlight";

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

async function getMarkdown(url: string) {
  const data = await fetch(url).then((res) => res.text());
  return await serialize(data, {
    mdxOptions: {
      development: process.env.NODE_ENV === "development",
      rehypePlugins: [rehypeHighlight as any],
    },
  });
}

export default async function BlogPostPage({ params }: Props) {
  const slug = params.blog;
  const post = await getBlogPost(slug);
  const mdxSource = await getMarkdown(post.markdownUrl);
  return <ClientSideBlogPostPage post={post} mdxSource={mdxSource} />;
}
