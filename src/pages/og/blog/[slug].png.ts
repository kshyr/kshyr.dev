import type { APIRoute } from "astro";
import { getBlogPost } from "@/lib/ghost/queries";
import { pngResponse, renderOgImage } from "@/lib/og/render";

export const GET: APIRoute = async ({ params }) => {
  const entry = await getBlogPost(params.slug!);
  if (!entry) return new Response("Not found", { status: 404 });
  const png = await renderOgImage(
    { eyebrow: "Blog post", title: entry.seo.title, description: entry.seo.description, tags: entry.tags },
    `blog:${entry.slug}:${entry.updatedAt}`
  );
  return pngResponse(png);
};
