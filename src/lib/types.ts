export type Kind = "project" | "blog";

export type PostLink = {
  label: string;
  url: string;
};

export type Heading = {
  id: string;
  text: string;
  level: 2 | 3;
};

export type Entry = {
  kind: Kind;
  title: string;
  slug: string;
  description: string;
  tags: string[];
  publishedAt: string;
  updatedAt: string;
  readingTime: number;
  featureImage: string | null;
  featured: boolean;
  isIdea: boolean;
};

export type Article = Entry & {
  html: string;
  links: PostLink[];
  headings: Heading[];
  seo: {
    title: string;
    description: string;
    image: string | null;
  };
};
