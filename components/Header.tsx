import Image from "next/image";
import ThemeSwitch from "./ThemeSwitch";
import Link from "next/link";

export default function Header() {
  return (
    <header className="flex h-24 items-center justify-between">
      <Link href="/" className="flex h-8 items-center justify-center">
        <Image
          src="/logo.svg"
          width={48}
          height={48}
          className="border-none shadow-none invert dark:invert-0"
          alt="logo"
        />
      </Link>
      <div className="flex items-center gap-8">
        <Link href="/" className="no-underline">
          <span className="nav-item">Home</span>
        </Link>
        <Link href="/library" className="no-underline">
          <span className="nav-item">Library</span>
        </Link>
        <ThemeSwitch />
      </div>
    </header>
  );
}
