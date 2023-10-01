import type { ReactNode } from "react";

export type Link = {
  title: string;
  url: string;
  icon?: string | ReactNode;
};

type Image = {
  url: string;
  alt: string;
  twClasses?: string;
};

export type Project = {
  slug: string;
  type: "project" | "blog";
  subtype?: "web";
  title: string;
  description: string;
  tags?: string[];
  links?: Link[];
  bodyMarkdown?: ReactNode;
};
