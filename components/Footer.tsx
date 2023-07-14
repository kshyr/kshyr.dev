"use client";

import GitHubLink from "./links/GitHubLink";
import LinkedInLink from "./links/LinkedInLink";
import DevDotToLink from "./links/DevDotToLink";

import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useLastVisited } from "@/lib/hooks/useLastVisited";

export default function Footer({
  contentRef,
}: {
  contentRef: RefObject<HTMLDivElement>;
}) {
  const [isAbsolute, setIsAbsolute] = useState(true);
  const pathname = usePathname();
  const { isEvaluated } = useLastVisited(pathname);
  const footerRef = useRef<HTMLDivElement>(null);

  const handleResize = useCallback(() => {
    if (footerRef.current && contentRef.current) {
      const contentHeight = contentRef.current.offsetHeight;
      const footerHeight = footerRef.current.offsetHeight;
      const windowHeight = document.documentElement.clientHeight;
      console.log({ contentHeight, windowHeight });
      setIsAbsolute(contentHeight + footerHeight <= windowHeight);
    }
  }, [contentRef]);

  useEffect(() => {
    handleResize();
  }, [pathname, contentRef, footerRef, handleResize, isEvaluated]);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);

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
