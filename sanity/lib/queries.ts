import { groq } from "next-sanity";
import { client } from "./client";
import { Project } from "@/lib/types";

export async function getProjects(): Promise<Project> {
  return client.fetch(
    groq`*[_type == "project"] {
      title,
      description,
      slug,
      tags,
      bodyMarkdown,
      githubUrl,
      liveUrl,
    }`
  );
}

type BlogPost = {
  title: string;
  slug: string;
  description: string;
  tags: string[];
  markdownUrl: string;
  devtoUrl: string;
};

export async function getBlogPosts(): Promise<BlogPost[]> {
  return client.fetch(
    groq`*[_type == "post"] {
      title,
      slug,
      description,
      tags,
      "markdownUrl": bodyMarkdown.asset->url,
      devtoUrl,
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
