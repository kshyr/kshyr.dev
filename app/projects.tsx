import { MDXRemote } from "next-mdx-remote/rsc";
import type { Link, Project } from "@/lib/types";
import {
  Vec,
  LinkStash,
  Terrarium,
  DigitalGarden,
  Spotlight,
  GitLobby,
  AnyStore,
  Chip8,
  TileBook,
  RayTracer,
  Spreadsheet,
  UICrates,
  GoSvelte,
} from "./markdowns";
import { Github, ExternalLink } from "lucide-react";
import { ReactNode } from "react";
import Image from "next/image";

function gitHubLink(url: string): Link {
  return { url, title: "GitHub", icon: (<Github size={20} />) as ReactNode };
}

function devToLink(url: string): Link {
  return {
    url,
    title: "dev.to",
    icon: (
      <Image
        src="dev-to.svg"
        width={22}
        height={22}
        className="m-0 border-none invert-0 dark:invert"
        alt="dev.to logo"
      />
    ) as ReactNode,
  };
}

function liveLink(url: string): Link {
  return {
    url,
    title: "Live",
    icon: (<ExternalLink size={20} />) as ReactNode,
  };
}

export const projects: Project[] = [
  {
    handle: "ui-crates",
    type: "project",
    subtype: "web",
    title: "UI Crates",
    description: "Social media platform for sharing UI components.",
    links: [
      gitHubLink("https://github.com/kshyr/ui-crates"),
      liveLink("https://ui-crates.vercel.app/"),
    ],
    tags: ["TypeScript", "React", "Next.js", "Tailwind CSS", "tRPC", "MySQL"],
    bodyMarkdown: <UICrates />,
  },
  {
    handle: "digital-garden",
    type: "project",
    subtype: "web",
    title: "Digital Garden",
    description:
      "Collaborative board, which allows users to store, update, and share access to text data, in an inviting environment.",
    tags: ["TypeScript", "React", "Tailwind CSS", "AWS", "GraphQL", "DynamoDB"],
    links: [
      gitHubLink("https://github.com/Tqkoyaki/DigitalGarden"),
      liveLink("https://master.dia4dpi85gb2h.amplifyapp.com/"),
    ],
    bodyMarkdown: <DigitalGarden />,
  },
  // {
  // handle: "go-svelte",
  // type: "project",
  // subtype: "web",
  // title: "Go + Svelte"
  // }
  {
    handle: "solid-spreadsheet",
    type: "project",
    subtype: "web",
    title: "SolidJS Spreadsheet",
    description:
      "Basics of Excel in browser, with help of SolidJS and TanStack Virtual.",
    tags: ["TypeScript", "SolidJS", "Tailwind CSS", "Virtualization"],
    bodyMarkdown: <Spreadsheet />,
  },
  {
    handle: "linkstash",
    type: "project",
    title: "LinkStash",
    description: "Minimalistic bookmark manager written in Rust.",
    tags: ["Rust"],
    links: [gitHubLink("https://github.com/kshyr/linkstash")],
    bodyMarkdown: <LinkStash />,
  },
  {
    handle: "vec",
    type: "blog",
    title: "Implementing Vec in Rust",
    description:
      "My first blog post, where I'm explaining basics of memory management and recreating a popular data structure - vector.",
    tags: ["Computer Science", "Rust"],
    links: [devToLink("https://dev.to/kshyr/implementing-vec-in-rust-1e2i")],
    bodyMarkdown: <Vec />,
  },
  {
    handle: "next-13-sanity",
    type: "project",
    subtype: "web",
    title: "Next 13 + Sanity.io",
    description:
      "Purpose of this project was to make others' lives easier and provide a quick way to start a project with Sanity Studio (admin panel for CMS) and be deploy-ready.",
    tags: ["TypeScript", "React", "Next.js", "Sanity CMS"],
  },
  {
    handle: "terrarium",
    type: "project",
    title: "Terrarium",
    description: "Ant simulation in Bevy (Rust game engine).",
    tags: ["TypeScript", "React", "Next.js", "Sanity CMS"],
    bodyMarkdown: <Terrarium />,
  },
  {
    handle: "spotlight",
    type: "project",
    title: "Spotlight",
    description: "Godot 4.0 game",
    tags: ["TypeScript", "React", "Next.js", "Sanity CMS"],
    bodyMarkdown: <Spotlight />,
  },
  {
    handle: "gitlobby",
    type: "project",
    subtype: "web",
    title: "GitLobby",
    description: "Godot 4.0 game",
    tags: ["TypeScript", "React", "Next.js", "Sanity CMS"],
    bodyMarkdown: <GitLobby />,
  },
  {
    handle: "any-store",
    type: "project",
    subtype: "web",
    title: "Any Store",
    description: "Godot 4.0 game",
    tags: ["TypeScript", "React", "Next.js", "Sanity CMS"],
    bodyMarkdown: <AnyStore />,
  },
  {
    handle: "chip-8",
    type: "project",
    subtype: "web",
    title: "CHIP-8 in TypeScript",
    description: "Godot 4.0 game",
    tags: ["TypeScript", "React", "Next.js", "Sanity CMS"],
    bodyMarkdown: <Chip8 />,
  },
  {
    handle: "tilebook",
    type: "project",
    subtype: "web",
    title: "Tilebook",
    description: "Godot 4.0 game",
    tags: ["TypeScript", "React", "Next.js", "Sanity CMS"],
    bodyMarkdown: <TileBook />,
  },
  {
    handle: "raytracer-rs",
    type: "project",
    title: "Raytracer-rs",
    description: "Godot 4.0 game",
    tags: ["TypeScript", "React", "Next.js", "Sanity CMS"],
    bodyMarkdown: <RayTracer />,
  },
];

export async function getREADME(handle: Project["handle"]) {
  const res = await fetch(
    `https://api.github.com/repos/kshyr/${handle}/readme`
  );
  const unwrapped = await res.json();
  const markdown = atob(unwrapped.content);
  return <MDXRemote source={markdown} />;
}
