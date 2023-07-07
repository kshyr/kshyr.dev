"use client";
import { cn } from "@/lib/utils";
import { motion, useMotionValue } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { hslToRgb } from "@/lib/utils";

const name = "Kostiantyn Shyrolapov";
const colors = ["#549855", "#ca7575", "#fada52", "#aa95ca"];

export default function Name() {
  return (
    <>
      {name.split("").map((letter, i) => {
        return <Letter key={letter + i} letter={letter} />;
      })}
    </>
  );
}

function Letter({ letter }: { letter: string }) {
  const { theme } = useTheme();
  const dark = hslToRgb("210 40% 98%");
  const light = hslToRgb("222.2 84% 4.9%");

  const color = useMotionValue(theme === "dark" ? dark : light);

  useEffect(() => {
    theme === "dark" ? color.set(dark) : color.set(light);
  }, [theme, color, dark, light]);

  return (
    <motion.span
      className={cn(
        "inline-block cursor-default text-foreground",
        letter === " " && "ml-3"
      )}
      initial={{ color: "var(--foreground)" }}
      whileHover={{
        y: -10,
        transition: {
          duration: 0.2,
        },
      }}
      style={{ color }}
      onHoverStart={() => {
        color.set(colors[Math.floor(Math.random() * colors.length)]);
      }}
      onHoverEnd={() => {
        theme === "dark" ? color.set(dark) : color.set(light);
      }}
    >
      {letter}
    </motion.span>
  );
}
