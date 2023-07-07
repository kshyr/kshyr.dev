"use client";

import GitHubLink from "./GitHubLink";
import DevDotToLink from "./DevDotToLink";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export default function Footer() {
  const [isAbsolute, setIsAbsolute] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const handleResize = () => {
      const pageHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;
      const footerHeight = document.querySelector("footer").offsetHeight;
      const isFooterBiggerThanScreen = pageHeight - footerHeight > windowHeight;
      setIsAbsolute(!isFooterBiggerThanScreen);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [pathname]);

  return (
    <footer
      className={cn(
        "flex h-20 w-full items-center justify-between",
        isAbsolute && "absolute bottom-0"
      )}
    >
      <span className="text-xs font-extralight text-muted-foreground md:text-sm">
        ©2023 Kostiantyn Shyrolapov
      </span>
      <div className="flex items-center">
        <DevDotToLink />
        <GitHubLink />
      </div>
    </footer>
  );
}
