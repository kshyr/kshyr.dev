import type { APIRoute } from "astro";
import { getIndexable } from "@/lib/ghost/queries";

const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

export const GET: APIRoute = async ({ site }) => {
  const entries = await getIndexable();
  const latest = entries[0]?.updatedAt;
  const urls = [
    { path: "/", lastmod: latest },
    { path: "/projects", lastmod: entries.find((e) => e.kind === "project")?.updatedAt },
    { path: "/blog", lastmod: entries.find((e) => e.kind === "blog")?.updatedAt },
    ...entries.map((e) => ({
      path: `/${e.kind === "project" ? "projects" : "blog"}/${e.slug}`,
      lastmod: e.updatedAt,
    })),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    ({ path, lastmod }) =>
      `  <url><loc>${escape(new URL(path, site).toString())}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}</url>`
  )
  .join("\n")}
</urlset>
`;
  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=300" },
  });
};
