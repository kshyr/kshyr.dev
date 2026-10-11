import { SITE } from "./site";
import type { Article } from "./types";

type JsonLd = Record<string, unknown>;

export function absolute(path: string, site: URL) {
  return new URL(path, site).toString();
}

export function personJsonLd(site: URL): JsonLd {
  return {
    "@type": "Person",
    "@id": absolute("/#person", site),
    name: SITE.author,
    url: site.toString(),
    jobTitle: SITE.jobTitle,
    worksFor: { "@type": "Organization", name: SITE.employer.name },
    sameAs: Object.values(SITE.social),
  };
}

export function websiteJsonLd(site: URL): JsonLd {
  return {
    "@type": "WebSite",
    "@id": absolute("/#website", site),
    url: site.toString(),
    name: SITE.name,
    description: SITE.description,
    inLanguage: SITE.locale,
    publisher: { "@id": absolute("/#person", site) },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[], site: URL): JsonLd {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absolute(item.path, site),
    })),
  };
}

export function articleJsonLd(article: Article, path: string, image: string, site: URL): JsonLd {
  const url = absolute(path, site);
  const common = {
    "@id": `${url}#article`,
    url,
    name: article.title,
    headline: article.seo.title,
    description: article.seo.description,
    image,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    keywords: article.tags.join(", "),
    inLanguage: SITE.locale,
    author: { "@id": absolute("/#person", site) },
    mainEntityOfPage: url,
  };
  if (article.kind === "blog") {
    return { "@type": "BlogPosting", ...common, timeRequired: `PT${article.readingTime}M` };
  }
  const repo = article.links.find((l) => new URL(l.url).hostname === "github.com");
  return repo
    ? { "@type": "SoftwareSourceCode", ...common, codeRepository: repo.url }
    : { "@type": "CreativeWork", ...common };
}

export function jsonLdScript(graph: JsonLd[]) {
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(
    /</g,
    "\\u003c"
  );
}
