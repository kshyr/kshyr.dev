import { useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import Image from "next/image";

export default function Navbar() {
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", () => {
    if (scrollY.get() < scrollY.getPrevious()) {
      setHidden(false);
    } else if (scrollY.get() > 200 && scrollY.get() > scrollY.getPrevious()) {
      setHidden(true);
    }
  });

  const variants = {
    visible: { opacity: 1, y: 0 },
    hidden: { opacity: 0, y: -100 },
  };

  return (
    <motion.header
      variants={variants}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.2 }}
      className="flex fixed top-0 left-0 w-full justify-between px-8 sm:px-16 py-8 font-agra text-base sm:text-xl font-bold items-center z-50 mix-blend-difference"
    >
      <Image src="logo.svg" alt="logo" height={64} width={64} />
      <ul className="h-full invisible md:visible flex gap-4 sm:gap-8 md:gap-8 lg:gap-12 xl:gap-16 justify-between items-center z-40">
        <li>
          <button
            onClick={() =>
              window.open(
                "https://docdro.id/BZHzkcl",
                "_blank",
                "noopener,noreferrer"
              )
            }
          >
            {"resume>"}
          </button>
        </li>
        <li>
          <a href="#skills">skills</a>
        </li>
        <li>
          <a href="#projects">projects</a>
        </li>
      </ul>
    </motion.header>
  );
}
