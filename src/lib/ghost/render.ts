import { unified } from "unified";
import rehypeParse from "rehype-parse";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import type { Element, ElementContent, Root, RootContent } from "hast";
import type { Heading, PostLink } from "@/lib/types";
import { uploadSizes } from "./image-sizes";

function classes(node: Element): string[] {
  const value = node.properties?.className;
  return Array.isArray(value) ? value.map(String) : [];
}

function isWhitespace(node: ElementContent) {
  return node.type === "text" && node.value.trim() === "";
}

function textOf(node: ElementContent): string {
  if (node.type === "text") return node.value;
  if (node.type === "element") return node.children.map(textOf).join("");
  return "";
}

function liftLeadingButtons(links: PostLink[]) {
  return (tree: Root) => {
    while (tree.children.length > 0) {
      const node = tree.children[0];
      if (node.type === "text" && node.value.trim() === "") {
        tree.children.shift();
        continue;
      }
      if (node.type !== "element" || !classes(node).includes("kg-button-card")) {
        break;
      }
      const anchor = node.children.find(
        (child): child is Element =>
          child.type === "element" && child.tagName === "a"
      );
      if (anchor?.properties?.href) {
        links.push({
          label: textOf(anchor).trim(),
          url: String(anchor.properties.href),
        });
      }
      tree.children.shift();
    }
    tree.children = tree.children.filter(
      (child) => child.type !== "text" || !isWhitespace(child)
    );
  };
}

// Ghost's own origin is private; site-relative links go through /content/*.
export function ghostRelative(siteUrl: string) {
  const prefix = siteUrl.replace(/\/$/, "") + "/";
  return <T>(value: T): T =>
    (typeof value === "string" && value.startsWith(prefix)
      ? "/" + value.slice(prefix.length)
      : value) as T;
}

function relativizeGhostUrls(siteUrl: string) {
  const rewrite = ghostRelative(siteUrl);

  return (tree: Root) => {
    const visit = (node: Root | RootContent) => {
      if (node.type === "element") {
        for (const attr of ["src", "href", "poster"]) {
          if (attr in node.properties) {
            node.properties[attr] = rewrite(node.properties[attr]) as string;
          }
        }
        if (typeof node.properties.srcSet === "string") {
          node.properties.srcSet = node.properties.srcSet
            .split(",")
            .map((entry) => rewrite(entry.trim()))
            .join(", ");
        }
      }
      if ("children" in node) node.children.forEach(visit);
    };
    visit(tree);
  };
}

function sizeUploads() {
  return async (tree: Root) => {
    const images: Element[] = [];
    const visit = (node: Root | RootContent) => {
      if (
        node.type === "element" &&
        node.tagName === "img" &&
        String(node.properties.src ?? "").startsWith("/content/") &&
        !(node.properties.width && node.properties.height)
      ) {
        images.push(node);
      }
      if ("children" in node) node.children.forEach(visit);
    };
    visit(tree);
    if (images.length === 0) return;

    const sizes = await uploadSizes(images.map((img) => String(img.properties.src)));
    for (const img of images) {
      const size = sizes.get(String(img.properties.src));
      if (size) Object.assign(img.properties, size);
    }
  };
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function collectHeadings(headings: Heading[]) {
  return (tree: Root) => {
    const seen = new Set<string>();
    for (const node of tree.children) {
      if (node.type !== "element" || (node.tagName !== "h2" && node.tagName !== "h3")) {
        continue;
      }
      const text = textOf(node).trim();
      let id = String(node.properties.id ?? "") || slugify(text) || "section";
      while (seen.has(id)) id += "-";
      seen.add(id);
      node.properties.id = id;
      headings.push({ id, text, level: node.tagName === "h2" ? 2 : 3 });
    }
  };
}

export async function renderPostHtml(html: string, siteUrl: string) {
  const links: PostLink[] = [];
  const headings: Heading[] = [];
  const file = await unified()
    .use(rehypeParse, { fragment: true })
    .use(() => liftLeadingButtons(links))
    .use(() => relativizeGhostUrls(siteUrl))
    .use(sizeUploads)
    .use(() => collectHeadings(headings))
    .use(rehypeHighlight, { detect: false })
    .use(rehypeStringify)
    .process(html);
  return { html: String(file), links, headings };
}
