// @ts-check
import { defineConfig, envField } from "astro/config";
import node from "@astrojs/node";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: process.env.SITE_URL ?? "https://kshyr.dev",
  output: "server",
  adapter: node({ mode: "standalone" }),
  trailingSlash: "never",
  build: { inlineStylesheets: "always" },
  env: {
    schema: {
      GHOST_URL: envField.string({ context: "server", access: "secret" }),
      GHOST_CONTENT_API_KEY: envField.string({ context: "server", access: "secret" }),
      SHOW_IDEAS: envField.boolean({ context: "server", access: "secret", default: false }),
    },
  },
  vite: {
    plugins: [tailwindcss()],
    // resvg is a native addon; keep it out of the Vite bundle.
    ssr: { external: ["@resvg/resvg-js"] },
    optimizeDeps: { exclude: ["@resvg/resvg-js"] },
  },
});
