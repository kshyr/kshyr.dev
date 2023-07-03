import Image from "next/image";
import ThemeSwitch from "./ThemeSwitch";
import Link from "next/link";
import GitHubLink from "./GitHubLink";
import DevDotToLink from "./DevDotToLink";

export default function Footer() {
  return (
    <footer className="flex h-20 items-center justify-between">
      <span className="text-sm font-extralight text-muted-foreground">
        ©2023 Kostiantyn Shyrolapov
      </span>
      <div className="flex items-center ">
        <DevDotToLink />
        <GitHubLink />
      </div>
    </footer>
  );
}
