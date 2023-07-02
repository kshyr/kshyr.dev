import { MDXRemote } from "next-mdx-remote/rsc";
import Vec from "./markdowns/implementing-vec.mdx";
import type { Project } from "@/lib/types";
import { headers } from "next/dist/client/components/headers";

const rawProjects: Project[] = [
  {
    type: "blog",
    title: "Implementing Vec in Rust",
    description:
      "My first blog post, where I'm explaining basics of memory management and recreating a popular data structure - vector.",
    tags: ["Computer Science", "Rust"],
    bodyMarkdown: <Vec />,
  },
  {
    handle: "linkstash",
    type: "project",
    title: "LinkStash",
    description: "Minimalistic bookmark manager written in Rust.",
    tags: ["Rust"],
  },
  // {
  //   handle: "ui-crates",
  //   type: "project",
  //   title: "UI-crates",
  //   description: "Social media for sharing UI components.",
  //   tags: ["TypeScript", "React", "Next.js", "tRPC", "Tailwind CSS"],
  // },
  {
    handle: "next-13-sanity",
    type: "project",
    title: "Next 13 + Sanity template",
    description:
      "Purpose of this project was to make others lives easier and provide a quick way to start a project with Sanity Studio (admin panel for CMS) and be deploy-ready.",
    tags: ["TypeScript", "React", "Next.js", "Sanity CMS"],
  },
];

async function getREADME(handle: Project["handle"]) {
  const res = await fetch(
    `https://api.github.com/repos/kshyr/${handle}/readme`
  );
  const unwrapped = await res.json();
  const markdown = atob(unwrapped.content);
  return <MDXRemote source={markdown} />;
}

export const projects: Project[] = [];

for (const rawProject of rawProjects) {
  if (rawProject.bodyMarkdown || rawProject.type === "blog") {
    projects.push(rawProject);
    continue;
  }
  const readmeMarkdown = getREADME(rawProject.handle);
  const updatedProject = {
    ...rawProject,
    bodyMarkdown: readmeMarkdown,
  } as Project;
  projects.push(updatedProject);
}
