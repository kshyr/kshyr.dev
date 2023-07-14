import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  Variants,
  motion,
  useMotionTemplate,
  useSpring,
  useTransform,
} from "framer-motion";
import { Skill } from "@/app/skills";

export default function SkillTag({
  skill,
  skillVariants,
}: {
  skill: Skill;
  skillVariants: Variants;
}) {
  const x = useSpring(0.5, { stiffness: 10000, damping: 500 });
  const y = useSpring(0.5, { stiffness: 10000, damping: 500 });
  const rotateX = useTransform(y, [0, 1], [15, -15]);
  const rotateY = useTransform(x, [0, 1], [-15, 15]);

  const diagonalMovement = useTransform<number, number>(
    [rotateX, rotateY],
    ([newRotateX, newRotateY]) => {
      const position: number = newRotateX + newRotateY;
      return position;
    }
  );

  const diagonal2Movement = useTransform<number, number>(
    [rotateX, rotateY],
    ([newRotateX, newRotateY]) => {
      const position: number = newRotateX - newRotateY;
      return position;
    }
  );

  const sheenPosition = useTransform(diagonalMovement, [-50, 50], [200, -100]);

  const sheenPosition2 = useTransform(
    diagonal2Movement,
    [-50, 50],
    [200, -100]
  );

  const sheenOpacity = useTransform(
    sheenPosition,
    [-100, 50, 200],
    [0.15, 0.05, 0.15]
  );

  const sheenOpacity2 = useTransform(
    sheenPosition2,
    [-100, 50, 200],
    [0.1, 0, 0.1]
  );

  const sheenGradient = useMotionTemplate`linear-gradient(55deg, transparent, 
            rgba(255 255 255 / ${sheenOpacity}) ${sheenPosition}%, transparent),linear-gradient(-35deg, transparent, 
            rgba(255 255 255 / ${sheenOpacity2}) ${sheenPosition2}%, transparent)`;

  function onHover(e: any) {
    const bounds = e.currentTarget.getBoundingClientRect();

    const xValue = (e.clientX - bounds.x) / e.currentTarget.clientWidth;
    const yValue = (e.clientY - bounds.y) / e.currentTarget.clientHeight;
    x.set(xValue, true);
    y.set(yValue, true);
  }

  return (
    <motion.div
      style={{
        x,
        y,
        rotateX,
        rotateY,
        backgroundImage: sheenGradient,
      }}
      onPointerMove={onHover}
      onHoverEnd={() => {
        x.set(0.5);
        y.set(0.5);
      }}
      variants={skillVariants}
      className="flex select-none items-center gap-2 rounded-md border border-border px-2 py-1 transition-colors dark:bg-primary/5 dark:hover:bg-primary/10"
    >
      <motion.div
        style={{
          x: useTransform(x, [0, 1], [-3, 4]),
          y: useTransform(y, [0, 1], [-3, 4]),
          filter: useMotionTemplate`drop-shadow(${useTransform(
            x,
            [0, 1],
            [0.2, -0.4]
          )}px ${useTransform(y, [0, 1], [0.2, -0.4])}px 2px rgba(0,0,0,0.4))`,
          rotateX: useTransform(rotateX, [12, -12], [1, -1]),
          rotateY: useTransform(rotateY, [-12, 12], [-1, 1]),
        }}
      >
        <Image
          draggable={false}
          src={skill.logoSrc}
          alt={skill.name + " logo"}
          width={skill.customWidth ?? 24}
          height={skill.customHeight ?? 24}
          className={cn(
            "m-0 rounded-none border-none shadow-none",
            skill?.twClasses
          )}
        />
      </motion.div>
      <motion.span
        style={{
          x: useTransform(x, [0, 1], [-2, 3]),
          y: useTransform(y, [0, 1], [-2, 3]),
          rotateX: useTransform(rotateX, [12, -12], [1, -1]),
          rotateY: useTransform(rotateY, [-12, 12], [-1, 1]),
          filter: useMotionTemplate`drop-shadow(${useTransform(
            x,
            [0, 1],
            [0.2, -0.4]
          )}px ${useTransform(y, [0, 1], [0.2, -0.4])}px 1px rgba(0,0,0,0.3))`,
        }}
        className="font-display text-[15px] font-normal"
      >
        {skill.name}
      </motion.span>
    </motion.div>
  );
}
