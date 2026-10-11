import type { APIRoute } from "astro";
import { pngResponse, renderOgImage } from "@/lib/og/render";
import { SITE } from "@/lib/site";

export const GET: APIRoute = async () =>
  pngResponse(
    await renderOgImage(
      { eyebrow: SITE.jobTitle, title: SITE.author, description: SITE.description },
      "site"
    )
  );
