import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function hslToRgb(hsl: string): string {
  const [hue, saturation, lightness] = hsl.split(" ").map(parseFloat);

  const hueDegrees = hue / 360;

  const saturationPercentage = saturation / 100;
  const lightnessPercentage = lightness / 100;

  const chroma =
    (1 - Math.abs(2 * lightnessPercentage - 1)) * saturationPercentage;
  const huePrime = hueDegrees * 6;
  const x = chroma * (1 - Math.abs((huePrime % 2) - 1));

  let red = 0;
  let green = 0;
  let blue = 0;

  if (huePrime >= 0 && huePrime < 1) {
    red = chroma;
    green = x;
  } else if (huePrime >= 1 && huePrime < 2) {
    red = x;
    green = chroma;
  } else if (huePrime >= 2 && huePrime < 3) {
    green = chroma;
    blue = x;
  } else if (huePrime >= 3 && huePrime < 4) {
    green = x;
    blue = chroma;
  } else if (huePrime >= 4 && huePrime < 5) {
    red = x;
    blue = chroma;
  } else if (huePrime >= 5 && huePrime < 6) {
    red = chroma;
    blue = x;
  }

  const lightnessAdjustment = lightnessPercentage - chroma / 2;

  red += lightnessAdjustment;
  green += lightnessAdjustment;
  blue += lightnessAdjustment;

  const r = Math.round(red * 255);
  const g = Math.round(green * 255);
  const b = Math.round(blue * 255);

  const hex = ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
  return `#${hex}`;
}
