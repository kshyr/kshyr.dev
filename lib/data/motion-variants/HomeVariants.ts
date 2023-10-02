import { Variants } from "framer-motion";

export const nameVariants: Variants = {
  initial: {
    opacity: 0,
    x: -60,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      delay: 0,
    },
  },
};

export const titleVariants: Variants = {
  initial: {
    opacity: 0,
    y: -40,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      delay: 0.3,
    },
  },
};

export const introVariants: Variants = {
  initial: {
    opacity: 0,
    y: 40,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: 0.8,
    },
  },
};

export const projectsSectionDelay = 1.2;

export const projectsVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      delay: projectsSectionDelay,
      staggerChildren: 0.1,
    },
  },
};

export const projectsMoreVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      delay: 2.5,
    },
  },
};

export const postsMoreVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      delay: 3,
    },
  },
};

export const dividerVariants: Variants = {
  initial: {
    width: 0,
  },
  animate: {
    width: "100%",
    transition: {
      delay: 2.5,
      duration: 0.2,
      type: "spring",
      stiffness: 400,
      damping: 30,
    },
  },
};

export const skillVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      delayChildren: projectsSectionDelay,
      staggerChildren: 0.15,
    },
  },
};
