"use client";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";
import "@code-hike/mdx/dist/index.css";
import { Inter, Roboto_Mono, Lexend_Deca } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NextTopLoader from "nextjs-toploader";
import { useRef } from "react";

const lexend = Lexend_Deca({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-lexend",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const roboto_mono = Roboto_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto-mono",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  return (
    <html lang="en">
      <body
        className={`${inter.className} ${roboto_mono.variable} ${lexend.variable} container max-w-5xl `}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <NextTopLoader color="#fff" />
          <main className="relative h-screen justify-between sm:pl-4 sm:pr-2 md:pt-2 lg:pt-6">
            <div ref={contentRef}>
              <Header />
              {children}
            </div>
            <Footer contentRef={contentRef} />
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
