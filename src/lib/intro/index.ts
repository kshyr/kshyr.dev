import { animate } from "framer-motion/dom";

type AnimateArgs = Parameters<typeof animate>;

export type IntroStep = {
  target: string | Element | Element[];
  from: Record<string, string>;
  to: AnimateArgs[1];
  options?: AnimateArgs[2];
};

export function shouldPlayIntro() {
  return document.documentElement.getAttribute("data-intro") === "play";
}

function elementsOf(target: IntroStep["target"]): HTMLElement[] {
  if (typeof target === "string") return Array.from(document.querySelectorAll<HTMLElement>(target));
  return (Array.isArray(target) ? target : [target]) as HTMLElement[];
}

export function playIntro(steps: IntroStep[]) {
  if (!shouldPlayIntro()) return;
  const root = document.documentElement;
  const resolved = steps.map((step) => ({ ...step, elements: elementsOf(step.target) }));

  for (const { elements, from } of resolved) {
    for (const el of elements) Object.assign(el.style, from);
  }
  root.removeAttribute("data-intro");

  const running = resolved
    .filter(({ elements }) => elements.length > 0)
    .map(({ elements, to, options }) => animate(elements, to as never, options as never));
  Promise.allSettled(running.map((a) => a.finished)).then(() => {
    for (const { elements, from } of resolved) {
      for (const el of elements) for (const prop of Object.keys(from)) el.style.removeProperty(toKebab(prop));
    }
  });
}

function toKebab(prop: string) {
  return prop.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
}
