import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { Inter, Lexend_Deca, Roboto_Mono } from "next/font/google";
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
  title: {
    template: "%s | kshyr.dev",
    default: "kshyr.dev | Kostiantyn Shyrolapov | Frontend Engineer",
  },
  description:
    "I specialize in web development - bringing designs and ideas to life, making experience both accessible and memorable to the end user.",
  creator: "Kostiantyn Shyrolapov",
  publisher: "Kostiantyn Shyrolapov",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} ${roboto_mono.variable} ${lexend.variable}`}
      >
        <PageWrapper>{children}</PageWrapper>
        <Analytics />
      </body>
    </html>
  );
}
