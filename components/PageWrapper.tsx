"use client";
import { ReactNode, useRef } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { ThemeProvider } from "./ThemeProvider";
import TopLoader from "./TopLoader";
//@ts-ignore
import { usePathname } from "next/navigation";

const stylingIngoredPaths = ["/studio", "/desk"];

export default function PageWrapper({ children }: { children: ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  if (stylingIngoredPaths.includes(pathname)) {
    return children;
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TopLoader />
      <main className="container relative h-screen max-w-4xl justify-between sm:pl-4 sm:pr-2  md:pt-2 lg:pt-6 ">
        <div ref={contentRef}>
          <Header />
          {children}
        </div>
        <Footer contentRef={contentRef} />
      </main>
    </ThemeProvider>
  );
}
