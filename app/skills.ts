export type Skill = {
    name: string;
    logoSrc: string;
    customWidth?: number;
    customHeight?: number;
    hoverFillColor?: string;
    twClasses?: string;
};

export const skills: Skill[] = [
    {
        name: "JavaScript",
        logoSrc:
            "https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png",
        twClasses: "rounded-[3px]",
    },
    {
        name: "TypeScript",
        logoSrc:
            "https://upload.wikimedia.org/wikipedia/commons/4/4c/Typescript_logo_2020.svg",
        twClasses: "rounded-[3px]",
    },
    {
        name: "React",
        logoSrc:
            "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg",
    },
    {
        name: "Next.js",
        logoSrc:
            "https://upload.wikimedia.org/wikipedia/commons/b/ba/Tabler-icons_brand-nextjs.svg",
        twClasses: "invert-0 dark:invert",
    },
    {
        name: "Tailwind CSS",
        logoSrc:
            "https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg",
    },
    // {
    //     name: "Sass",
    //     logoSrc:
    //         "https://upload.wikimedia.org/wikipedia/commons/9/96/Sass_Logo_Color.svg",
    // },
    // {
    //     name: "Go",
    //     logoSrc:
    //         "https://upload.wikimedia.org/wikipedia/commons/0/05/Go_Logo_Blue.svg",
    //     customHeight: 30,
    //     customWidth: 30,
    // },

    {
        name: "MySQL",
        logoSrc: "/mysql.png",
        customHeight: 30,
        customWidth: 30,
    },
    {
        name: "PostgreSQL",
        logoSrc:
            "https://upload.wikimedia.org/wikipedia/commons/2/29/Postgresql_elephant.svg",
    },
    {
        name: "GraphQL",
        logoSrc:
            "https://upload.wikimedia.org/wikipedia/commons/1/17/GraphQL_Logo.svg",
    },
    {
        name: "Docker",
        logoSrc:
            "https://upload.wikimedia.org/wikipedia/commons/a/a7/Docker-svgrepo-com.svg",
        customHeight: 30,
        customWidth: 30,
    },
    {
        name: "AWS",
        logoSrc: "/aws_containers.png",
    },
    {
        name: "Rust",
        logoSrc:
            "https://upload.wikimedia.org/wikipedia/commons/d/d5/Rust_programming_language_black_logo.svg",
        twClasses: "invert-0 dark:invert",
    },
];
