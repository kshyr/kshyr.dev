import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getIndexable } from "@/lib/ghost/queries";
import { SITE } from "@/lib/site";

export const GET: APIRoute = async ({ site }) => {
  const posts = (await getIndexable()).filter((e) => e.kind === "blog");
  return rss({
    title: `${SITE.author} — blog`,
    description: SITE.description,
    site: site!,
    items: posts.map((post) => ({
      title: post.title,
      link: `/blog/${post.slug}`,
      pubDate: new Date(post.publishedAt),
      description: post.description,
      categories: post.tags,
    })),
    customData: `<language>en</language>`,
  });
};
