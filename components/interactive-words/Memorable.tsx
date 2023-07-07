"use client";
import { colors } from "@/lib/data/colors";
import { Variants, motion } from "framer-motion";

type MemorableLetter = {
  xOffset: number;
  yOffset: number;
  rotate: number;
  scale: number;
  color: string;
};

const letters: MemorableLetter[] = [
  {
    xOffset: -25,
    yOffset: 15,
    rotate: 20,
    scale: 1.8,
    color: colors[0],
  },
  {
    xOffset: -20,
    yOffset: 25,
    rotate: -10,
    scale: 1.4,
    color: colors[1],
  },
  {
    xOffset: -10,
    yOffset: 20,
    rotate: -20,
    scale: 2,
    color: colors[2],
  },
  {
    xOffset: 3,
    yOffset: 20,
    rotate: 30,
    scale: 1.5,
    color: colors[3],
  },
  {
    xOffset: 10,
    yOffset: 25,
    rotate: 3,
    scale: 2,
    color: colors[2],
  },
  {
    xOffset: 20,
    yOffset: 20,
    rotate: -20,
    scale: 1.7,
    color: colors[1],
  },
  {
    xOffset: 30,
    yOffset: 30,
    rotate: -5,
    scale: 1.4,
    color: colors[0],
  },
  {
    xOffset: 40,
    yOffset: 25,
    rotate: 10,
    scale: 1.8,
    color: colors[1],
  },

  {
    xOffset: 50,
    yOffset: 30,
    rotate: 20,
    scale: 1.5,
    color: colors[2],
  },
];

export function Memorable() {
  const word = "memorable";
  return (
    <motion.strong
      whileHover="animate"
      className="select-none whitespace-nowrap transition-colors hover:text-foreground lg:select-text"
    >
      {word.split("").map((letter, i) => {
        const letterVariant: Variants = {
          animate: {
            x: letters[i].xOffset,
            y: letters[i].yOffset,
            rotate: letters[i].rotate,
            scale: letters[i].scale,
            color: letters[i].color,
            transition: {
              duration: 0.3,
            },
          },
        };

        return (
          <motion.span
            variants={letterVariant}
            className="inline-block"
            key={letter + i}
          >
            {letter}
          </motion.span>
        );
      })}
    </motion.strong>
  );
}
