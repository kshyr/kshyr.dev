import { groq } from "next-sanity";
import { client } from "./client";
import type { BlogPost, Project } from "@/lib/types";

export async function getFeatured() {
  return client.fetch(
    groq`*[_type == "featured"][0] {
      "projects": featuredProjects[0...3]->{
        title,
        description,
        "slug": slug.current,
        "tags": tags[]->name
      },
      "posts": featuredPosts[0...1]->{
        title,
        description,
        "slug": slug.current,
        "tags": tags[]->name
      }
    }`
  );
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  return client.fetch(
    groq`*[_type == "post"][] {
      title,
      description,
      "slug": slug.current,
      "tags": tags[]->name
    }`
  );
}

export async function getProjects(): Promise<Project[]> {
  return client.fetch(
    groq`*[_type == "project"][] {
      title,
      description,
      "slug": slug.current,
      "tags": tags[]->name
    }`
  );
}

export async function getBlogPost(slug: string): Promise<BlogPost> {
  return client.fetch(
    groq`*[_type == "post" && slug.current == $slug][0] {
      title,
      slug,
      description,
      "tags": tags[]->name,
      "markdownUrl": bodyMarkdown.asset->url,
      devtoUrl,
    }`,
    { slug }
  );
}

export async function getProject(slug: string): Promise<Project> {
  return client.fetch(
    groq`*[_type == "project" && slug.current == $slug][0] {
      title,
      description,
      slug,
      "tags": tags[]->name,
      "markdownUrl": bodyMarkdown.asset->url,
      githubUrl,
      liveUrl,
    }`,
    { slug }
  );
}
