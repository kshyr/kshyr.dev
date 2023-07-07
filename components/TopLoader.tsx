"use client";
import { hslToRgb } from "@/lib/utils";
import { useTheme } from "next-themes";
import NextTopLoader from "nextjs-toploader";
import { useEffect, useState } from "react";
export default function TopLoader() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const dark = hslToRgb("210 40% 98%");
  const light = hslToRgb("222.2 84% 4.9%");
  const primaryColor = theme === "dark" ? dark : light;
  if (!mounted) return null;

  return <NextTopLoader color={primaryColor} />;
}
