"use client";

import GitHubLink from "./links/GitHubLink";
import LinkedInLink from "./links/LinkedInLink";
import DevDotToLink from "./links/DevDotToLink";

import { RefObject, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export default function Footer({
  contentRef,
}: {
  contentRef: RefObject<HTMLDivElement>;
}) {
  const [isAbsolute, setIsAbsolute] = useState(true);
  const footerRef = useRef<HTMLDivElement>(null);

  function handleResize() {
    if (footerRef.current && contentRef.current) {
      const contentHeight = contentRef.current.offsetHeight;
      const footerHeight = footerRef.current.offsetHeight;
      const windowHeight = window.innerHeight;
      console.log({ contentHeight, footerHeight, windowHeight });
      setIsAbsolute(contentHeight + footerHeight <= windowHeight);
    }
  }

  useEffect(() => {
    handleResize();

    const resizeObserver = new ResizeObserver(handleResize);
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }

    window.addEventListener("resize", handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [contentRef]);

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
