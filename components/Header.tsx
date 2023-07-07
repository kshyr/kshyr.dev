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
  {
    name: "About",
    href: "/about",
  },
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
        className="flex h-8 items-center justify-center"
        draggable={false}
      >
        <Logo />
      </Link>
      <div className="flex items-center gap-8 font-display">
        {navItems.map((navItem) => {
          return (
            <Link
              key={navItem.name}
              href={navItem.href}
              className="cursor-default no-underline"
            >
              <span className="nav-item">{navItem.name}</span>
            </Link>
          );
        })}

        <ThemeSwitch />
      </div>
    </header>
  );
}
