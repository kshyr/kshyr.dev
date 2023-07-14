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
    handle: string;
    type: "project" | "blog";
    subtype?: "web";
    title: string;
    description: string;
    tags?: string[];
    previewUrl?: string;
    links?: Link[];
    bodyMarkdown?: ReactNode;
};
