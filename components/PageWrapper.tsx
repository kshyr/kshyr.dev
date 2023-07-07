"use client";
import { ReactNode, useRef } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { ThemeProvider } from "./ThemeProvider";
import TopLoader from "./TopLoader";

export default function PageWrapper({ children }: { children: ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TopLoader />
      <main className="relative h-screen justify-between sm:pl-4 sm:pr-2 md:pt-2 lg:pt-6">
        <div ref={contentRef}>
          <Header />
          {children}
        </div>
        <Footer contentRef={contentRef} />
      </main>
    </ThemeProvider>
  );
}
