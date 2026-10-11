import { SHOW_IDEAS } from "astro:env/server";
import { ghostFetch } from "./client";
import { ghostRelative, renderPostHtml } from "./render";
import type { Article, Entry, Kind } from "@/lib/types";

const PROJECT_TAG = "hash-project";
const IDEA_TAG = "hash-idea";

function filterFor(kind: Kind, extra?: string) {
  const parts = [kind === "project" ? `tag:${PROJECT_TAG}` : `tag:-${PROJECT_TAG}`];
  if (!SHOW_IDEAS) parts.push(`tag:-${IDEA_TAG}`);
  if (extra) parts.push(extra);
  return parts.join("+");
}

type GhostTag = { name: string; slug: string; visibility: "public" | "internal" };

type GhostPost = {
  title: string;
  slug: string;
  custom_excerpt: string | null;
  excerpt: string | null;
  published_at: string;
  updated_at: string;
  reading_time: number;
  feature_image: string | null;
  featured: boolean;
  tags?: GhostTag[];
  html?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  og_image?: string | null;
};

const LIST_FIELDS = [
  "title",
  "slug",
  "custom_excerpt",
  "excerpt",
  "published_at",
  "updated_at",
  "reading_time",
  "feature_image",
  "featured",
  // Ghost only computes reading_time when html is among the fields.
  "html",
].join(",");

const ARTICLE_FIELDS = `${LIST_FIELDS},meta_title,meta_description,og_image`;

function toEntry(post: GhostPost, siteUrl: string): Entry {
  const tags = post.tags ?? [];
  return {
    kind: tags.some((t) => t.slug === PROJECT_TAG) ? "project" : "blog",
    title: post.title,
    slug: post.slug,
    description: post.custom_excerpt ?? post.excerpt ?? "",
    tags: tags.filter((t) => t.visibility === "public").map((t) => t.name),
    publishedAt: post.published_at,
    updatedAt: post.updated_at,
    readingTime: post.reading_time,
    featureImage: ghostRelative(siteUrl)(post.feature_image),
    featured: post.featured,
    isIdea: tags.some((t) => t.slug === IDEA_TAG),
  };
}

async function listPosts(filter: string, limit = "all") {
  const [{ posts }, url] = await Promise.all([
    ghostFetch<{ posts: GhostPost[] }>("posts", {
      filter,
      limit,
      include: "tags",
      fields: LIST_FIELDS,
      order: "published_at desc",
    }),
    getSiteUrl(),
  ]);
  return posts.map((post) => toEntry(post, url)).sort((a, b) => Number(a.isIdea) - Number(b.isIdea));
}

let siteUrl: Promise<string> | undefined;

function getSiteUrl() {
  siteUrl ??= ghostFetch<{ settings: { url: string } }>("settings")
    .then(({ settings }) => settings.url)
    .catch((err) => {
      siteUrl = undefined;
      throw err;
    });
  return siteUrl;
}

async function getArticle(kind: Kind, slug: string): Promise<Article | null> {
  // Slugs go into an NQL filter, so only accept Ghost's slug alphabet.
  if (!/^[a-z0-9-]+$/.test(slug)) return null;

  const [
    {
      posts: [post],
    },
    url,
  ] = await Promise.all([
    ghostFetch<{ posts: GhostPost[] }>("posts", {
      filter: filterFor(kind, `slug:${slug}`),
      limit: "1",
      include: "tags",
      fields: ARTICLE_FIELDS,
    }),
    getSiteUrl(),
  ]);
  if (!post) return null;

  const entry = toEntry(post, url);
  const rendered = await renderPostHtml(post.html ?? "", url);
  return {
    ...entry,
    ...rendered,
    seo: {
      title: post.meta_title || entry.title,
      description: post.meta_description || entry.description,
      image: ghostRelative(url)(post.og_image) || entry.featureImage,
    },
  };
}

export async function getFeatured() {
  const [projects, posts] = await Promise.all([
    listPosts(`${filterFor("project", "featured:true")}+tag:-${IDEA_TAG}`, "3"),
    listPosts(`${filterFor("blog", "featured:true")}+tag:-${IDEA_TAG}`, "1"),
  ]);
  return { projects, posts };
}

export const getProjects = () => listPosts(filterFor("project"));
export const getBlogPosts = () => listPosts(filterFor("blog"));
export const getProject = (slug: string) => getArticle("project", slug);
export const getBlogPost = (slug: string) => getArticle("blog", slug);

export async function getIndexable() {
  const [{ posts }, url] = await Promise.all([
    ghostFetch<{ posts: GhostPost[] }>("posts", {
      filter: `tag:-${IDEA_TAG}`,
      limit: "all",
      include: "tags",
      fields: LIST_FIELDS,
      order: "published_at desc",
    }),
    getSiteUrl(),
  ]);
  return posts.map((post) => toEntry(post, url));
}
