"use client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const name = "Kostiantyn Shyrolapov";
const colors = ["#549855", "#aa5555", "#fada52"];

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
  return (
    <motion.span
      className={cn("inline-block cursor-default", letter === " " && "ml-3")}
      whileHover={{
        color: colors[Math.floor(Math.random() * colors.length)],
        y: -10,
        transition: {
          duration: 0.2,
        },
      }}
    >
      {letter}
    </motion.span>
  );
}
