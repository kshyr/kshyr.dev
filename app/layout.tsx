import "./globals.css";
import "@code-hike/mdx/dist/index.css";
import { Analytics } from "@vercel/analytics/react";
import { Inter, Roboto_Mono, Lexend_Deca } from "next/font/google";
import PageWrapper from "@/components/PageWrapper";

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

export const metadata = {
  title: "kshyr | Kostiantyn Shyrolapov | Frontend Engineer",
  description:
    "I specialize in web development - bringing designs and ideas to life, and always doing my best to make experience both accessible and memorable to the end user.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} ${roboto_mono.variable} ${lexend.variable} container max-w-5xl `}
      >
        <PageWrapper>{children}</PageWrapper>
        <Analytics />
      </body>
    </html>
  );
}
