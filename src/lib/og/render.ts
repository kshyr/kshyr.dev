// satori can't read WOFF2; fonts must be WOFF or TTF.
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import type SatoriFn from "satori";
import { Resvg } from "@resvg/resvg-js";
import { SITE } from "@/lib/site";

const require = createRequire(import.meta.url);
// satori's ES module build references __dirname, so load the CommonJS one.
const satori: typeof SatoriFn = require("satori").default;
const fontFile = (pkg: string, file: string) => readFile(require.resolve(`${pkg}/files/${file}`));

let fonts: Promise<Parameters<typeof SatoriFn>[1]["fonts"]> | undefined;
function loadFonts() {
  fonts ??= Promise.all([
    fontFile("@fontsource/lexend-deca", "lexend-deca-latin-700-normal.woff"),
    fontFile("@fontsource/inter", "inter-latin-400-normal.woff"),
    fontFile("@fontsource/inter", "inter-latin-600-normal.woff"),
  ]).then(([display, regular, semibold]) => [
    { name: "Lexend Deca", data: display, weight: 700, style: "normal" },
    { name: "Inter", data: regular, weight: 400, style: "normal" },
    { name: "Inter", data: semibold, weight: 600, style: "normal" },
  ]);
  return fonts;
}

type Node = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, ...children: unknown[]): Node => ({
  type,
  props: { style: { display: "flex", ...style }, children },
});

export type OgCard = {
  eyebrow: string;
  title: string;
  description?: string;
  tags?: string[];
};

const cache = new Map<string, Promise<Buffer>>();

export function renderOgImage(card: OgCard, cacheKey: string) {
  let png = cache.get(cacheKey);
  if (!png) {
    png = draw(card);
    png.catch(() => cache.delete(cacheKey));
    cache.set(cacheKey, png);
    if (cache.size > 200) cache.delete(cache.keys().next().value!);
  }
  return png;
}

async function draw({ eyebrow, title, description, tags = [] }: OgCard) {
  const tree = h(
    "div",
    {
      width: "100%",
      height: "100%",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: "72px 80px",
      background: "linear-gradient(135deg, #020817 0%, #0f172a 60%, #1e293b 100%)",
      color: "#f8fafc",
      fontFamily: "Inter",
    },
    h(
      "div",
      { flexDirection: "column", gap: "24px" },
      h("div", { fontSize: 28, fontWeight: 600, color: "#94a3b8", letterSpacing: 1 }, eyebrow.toUpperCase()),
      h(
        "div",
        { fontFamily: "Lexend Deca", fontSize: title.length > 48 ? 60 : 72, fontWeight: 700, lineHeight: 1.1 },
        title
      ),
      description
        ? h("div", { fontSize: 30, color: "#cbd5e1", lineHeight: 1.4, maxWidth: 980 }, description)
        : null
    ),
    h(
      "div",
      { justifyContent: "space-between", alignItems: "flex-end" },
      h(
        "div",
        { gap: "12px", flexWrap: "wrap", maxWidth: 760 },
        ...tags.slice(0, 4).map((tag) =>
          h(
            "div",
            { fontSize: 24, padding: "8px 18px", borderRadius: 10, background: "#1e293b", color: "#e2e8f0" },
            tag
          )
        )
      ),
      h(
        "div",
        { flexDirection: "column", alignItems: "flex-end" },
        h("div", { fontFamily: "Lexend Deca", fontSize: 34, fontWeight: 700 }, SITE.name),
        h("div", { fontSize: 22, color: "#94a3b8" }, SITE.author)
      )
    )
  );

  const svg = await satori(tree as never, { width: 1200, height: 630, fonts: await loadFonts() });
  return new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();
}

export function pngResponse(png: Buffer) {
  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400" },
  });
}
