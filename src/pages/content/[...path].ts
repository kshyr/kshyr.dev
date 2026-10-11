import type { APIRoute } from "astro";
import { ghostOrigin } from "@/lib/ghost/client";

const roots = new Set(["images", "media", "files"]);
const forwardedHeaders = ["content-type", "content-length", "cache-control", "etag", "last-modified"];

export const GET: APIRoute = async ({ params, request }) => {
  const parts = (params.path ?? "").split("/");
  if (!roots.has(parts[0]) || parts.some((part) => part === ".." || part === "")) {
    return new Response("Not found", { status: 404 });
  }

  // The timeout covers Ghost's response headers only, not streaming the body.
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), 3000);
  let upstream: Response;
  try {
    upstream = await fetch(`${ghostOrigin()}/content/${parts.map(encodeURIComponent).join("/")}`, {
      headers: {
        "if-none-match": request.headers.get("if-none-match") ?? "",
        "if-modified-since": request.headers.get("if-modified-since") ?? "",
      },
      signal: abort.signal,
    });
  } catch {
    return new Response("Bad gateway", { status: 502 });
  } finally {
    clearTimeout(timer);
  }

  const headers = new Headers();
  for (const name of forwardedHeaders) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }
  return new Response(upstream.body, { status: upstream.status, headers });
};
