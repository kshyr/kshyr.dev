export const COLORS = ["#549855", "#ca7575", "#fada52", "#aa95ca"];

export type Skill = {
  name: string;
  logo: string;
  width?: number;
  height?: number;
  invert?: boolean;
  rounded?: boolean;
};

export const SKILLS: Skill[] = [
  { name: "JavaScript", logo: "/skills/javascript.png", rounded: true },
  { name: "TypeScript", logo: "/skills/typescript.svg", rounded: true },
  { name: "React", logo: "/skills/react.svg" },
  { name: "Next.js", logo: "/skills/nextjs.svg", invert: true },
  { name: "Tailwind CSS", logo: "/skills/tailwind.svg" },
  { name: "MySQL", logo: "/skills/mysql.png", width: 30, height: 30 },
  { name: "PostgreSQL", logo: "/skills/postgresql.svg" },
  { name: "GraphQL", logo: "/skills/graphql.svg" },
  { name: "Docker", logo: "/skills/docker.svg", width: 30, height: 30 },
  { name: "AWS", logo: "/skills/aws.png" },
  { name: "Rust", logo: "/skills/rust.svg", invert: true },
];
