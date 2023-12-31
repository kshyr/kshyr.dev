import { cn } from "@/lib/utils";
import Link from "next/link";
import Logo from "./Logo";

type NavItem = {
  name: string;
  href: string;
};

const navItems: NavItem[] = [
  {
    name: "Home",
    href: "/",
  },
  // // {
  // //   name: "About",
  // //   href: "/about",
  // // },
  {
    name: "Blog",
    href: "/blog",
  },
  {
    name: "Projects",
    href: "/projects",
  },
];

export default function Header() {
  return (
    <header className="flex h-24 items-center justify-between pr-4">
      <Link
        href="/"
        className="flex h-8 w-10 items-center justify-center md:w-14 lg:w-auto"
      >
        <Logo />
      </Link>
      <div className="flex items-center gap-5 font-display md:gap-8">
        {navItems.map((navItem) => {
          return (
            <Link
              key={navItem.name}
              href={navItem.href}
              className="cursor-default select-none no-underline"
            >
              <span
                className={cn(
                  "font-bold tracking-wide text-foreground transition-colors",
                  "hover:cursor-pointer hover:text-muted-foreground active:text-muted-foreground/70",
                  "text-sm md:text-[16px]"
                )}
              >
                {navItem.name}
              </span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
