"use client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function Accessible() {
  const [isMobile, setIsMobile] = useState(false);
  const { theme } = useTheme();
  const tagColor = theme === "dark" ? "text-green-800" : "text-green-500";

  const word = (
    <strong className="transition-colors hover:text-foreground">
      accessible
    </strong>
  );

  const content = (
    <>
      <span className={cn("font-mono", tagColor)}>
        {"<"}
        <b>strong</b>
        {"> "}
      </span>
      <b className="font-sans font-semibold">accessible</b>
      <span className={cn("font-mono", tagColor)}>
        {" </"}
        <b>strong</b>
        {">"}
      </span>
    </>
  );

  useEffect(() => {
    const handleResize = () => {
      const isMobileDevice = window.innerWidth <= 1024;
      setIsMobile(isMobileDevice);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const tooltip = (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="cursor-help select-none lg:select-text">
          {word}
        </TooltipTrigger>
        <TooltipContent>{content}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  const popover = (
    <Popover>
      <PopoverTrigger>{word}</PopoverTrigger>
      <PopoverContent className="whitespace-nowrap bg-primary text-primary-foreground">
        {content}
      </PopoverContent>
    </Popover>
  );

  return isMobile ? popover : tooltip;
}
