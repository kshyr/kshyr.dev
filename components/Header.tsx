import { cn } from "@/lib/utils";
import ThemeSwitch from "./ThemeSwitch";
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
    name: "Library",
    href: "/library",
  },
];

export default function Header() {
  return (
    <header className="flex h-24 items-center justify-between">
      <Link
        href="/"
        className="flex h-8 w-10 items-center justify-center md:w-14 lg:w-auto"
        draggable={false}
      >
        <Logo />
      </Link>
      <div className="flex items-center gap-5 font-display md:gap-8">
        {navItems.map((navItem) => {
          return (
            <Link
              draggable={false}
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

        <ThemeSwitch />
      </div>
    </header>
  );
}
