// Front matter: title, slug, excerpt, date, tags, featured, links[{label,url}].
// Existing slugs are skipped; pass --update to overwrite them.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { marked } from "marked";
import { adminApi, uploadImage, waitForGhost } from "./ghost-admin.mjs";

const adminKey = process.env.GHOST_ADMIN_API_KEY;
if (!adminKey) {
  console.error("GHOST_ADMIN_API_KEY is missing; run `pnpm ghost:setup` first.");
  process.exit(1);
}
const auth = { adminKey };
const update = process.argv.includes("--update");

const escape = (value) =>
  String(value).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

function buttonCard({ label, url }) {
  return `<div class="kg-card kg-button-card kg-align-left"><a href="${escape(url)}" class="kg-btn kg-btn-accent">${escape(label)}</a></div>`;
}

const uploads = new Map();
async function withImages(html, file) {
  const sources = new Set([...html.matchAll(/<img\b[^>]*\ssrc="([^"]+)"/g)].map((m) => m[1]));
  for (const src of sources) {
    if (/^(?:[a-z][a-z0-9+.-]*:|\/|#)/i.test(src)) continue;
    const image = new URL(src, file);
    if (!existsSync(image)) throw new Error(`${fileURLToPath(file)}: image not found: ${src}`);
    if (!uploads.has(image.href)) uploads.set(image.href, await uploadImage(image, auth));
    html = html.replaceAll(`src="${src}"`, `src="${uploads.get(image.href)}"`);
  }
  return html.replace(
    /^(?:<p>)?(<img\b[^>]*>)(?:<\/p>)?$/gm,
    '<figure class="kg-card kg-image-card">$1</figure>'
  );
}

function readSeed(file) {
  const { data, content } = matter(readFileSync(file, "utf8"));
  for (const field of ["title", "slug", "excerpt", "date"]) {
    if (!data[field]) throw new Error(`${file}: missing "${field}" in front matter`);
  }
  return { data, content };
}

async function toPost(file, { data, content }, kind, isIdea) {
  const tags = [
    ...(data.tags ?? []),
    ...(kind === "projects" ? ["#project"] : []),
    ...(isIdea ? ["#idea"] : []),
  ];
  return {
    title: data.title,
    slug: data.slug,
    custom_excerpt: data.excerpt,
    featured: Boolean(data.featured),
    status: "published",
    published_at: new Date(data.date).toISOString(),
    tags: tags.map((name) => ({ name })),
    html: (data.links ?? []).map(buttonCard).join("") + (await withImages(marked.parse(content), file)),
  };
}

await waitForGhost();

const counts = { created: 0, updated: 0, skipped: 0 };
const sources = [
  { dir: "projects", kind: "projects", isIdea: false },
  { dir: "blog", kind: "blog", isIdea: false },
  { dir: "ideas/projects", kind: "projects", isIdea: true },
  { dir: "ideas/blog", kind: "blog", isIdea: true },
];
for (const { dir: path, kind, isIdea } of sources) {
  const dir = new URL(`../content/${path}/`, import.meta.url);
  if (!existsSync(dir)) continue;
  for (const name of readdirSync(dir).filter((f) => f.endsWith(".md")).sort()) {
    const file = new URL(name, dir);
    const seed = readSeed(file);
    const existing = await adminApi(`posts/slug/${seed.data.slug}/`, { auth });
    if (existing && !update) {
      counts.skipped++;
      console.log(`= ${path}/${seed.data.slug} (exists)`);
      continue;
    }
    const post = await toPost(file, seed, kind, isIdea);

    if (!existing) {
      await adminApi("posts/?source=html", { method: "POST", body: { posts: [post] }, auth });
      counts.created++;
      console.log(`+ ${path}/${post.slug}`);
    } else {
      const [{ id, updated_at }] = existing.posts;
      await adminApi(`posts/${id}/?source=html`, {
        method: "PUT",
        body: { posts: [{ ...post, updated_at }] },
        auth,
      });
      counts.updated++;
      console.log(`~ ${path}/${post.slug}`);
    }
  }
}
console.log(`Done: ${counts.created} created, ${counts.updated} updated, ${counts.skipped} skipped.`);
