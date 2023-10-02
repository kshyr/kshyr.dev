export type BlogPost = {
  title: string;
  slug: string;
  description: string;
  tags: string[];
  markdownUrl: string;
  devtoUrl: string;
};

export type Project = {
  title: string;
  slug: string;
  description: string;
  tags: string[];
  markdownUrl: string;
  githubUrl: string;
  liveUrl: string;
};
