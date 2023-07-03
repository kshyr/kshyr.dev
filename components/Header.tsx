import Image from "next/image";
import ThemeSwitch from "./ThemeSwitch";
import Link from "next/link";
import Logo from "./Logo";

export default function Header() {
  return (
    <header className="flex h-24 items-center justify-between">
      <Link href="/" className="flex h-8 items-center justify-center">
        <Logo />
      </Link>
      <div className="flex items-center gap-8 font-display">
        <Link href="/" className="cursor-default no-underline">
          <span className="nav-item">Home</span>
        </Link>
        <Link href="/library" className="cursor-default no-underline">
          <span className="nav-item">Library</span>
        </Link>
        <ThemeSwitch />
      </div>
    </header>
  );
}
