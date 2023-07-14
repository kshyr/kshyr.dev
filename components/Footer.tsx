"use client";

import GitHubLink from "./GitHubLink";
import DevDotToLink from "./DevDotToLink";
import { RefObject, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import Image from "next/image";
import LinkedInLink from "./LinkedInLink";

export default function Footer({
  contentRef,
}: {
  contentRef: RefObject<HTMLDivElement>;
}) {
  const [isAbsolute, setIsAbsolute] = useState(true);
  const pathname = usePathname();
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (footerRef.current && contentRef.current) {
        const contentHeight = contentRef.current.offsetHeight;
        const footerHeight = footerRef.current.offsetHeight;
        const windowHeight = document.documentElement.clientHeight;
        console.log({ contentHeight, windowHeight });
        setIsAbsolute(contentHeight + footerHeight <= windowHeight);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [pathname, contentRef, footerRef]);

  return (
    <footer
      ref={footerRef}
      className={cn(
        "flex h-20 w-full items-center justify-between",
        isAbsolute && "absolute bottom-0"
      )}
    >
      <span className="text-xs font-extralight text-muted-foreground md:text-sm">
        ©2023 Kostiantyn Shyrolapov
      </span>
      <div className="flex h-full items-center">
        <LinkedInLink />
        <DevDotToLink />
        <GitHubLink />
      </div>
    </footer>
  );
}
