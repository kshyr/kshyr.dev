import { GHOST_CONTENT_API_KEY, GHOST_URL } from "astro:env/server";

export function ghostOrigin(): string {
  return GHOST_URL.replace(/\/$/, "");
}

const TIMEOUT_MS = 3000;
const MAX_CACHED = 500;
const lastGood = new Map<string, unknown>();

function remember(key: string, value: unknown) {
  lastGood.delete(key);
  lastGood.set(key, value);
  if (lastGood.size > MAX_CACHED) lastGood.delete(lastGood.keys().next().value!);
}

// When Ghost is slow or down, serve the last good response for the same query.
export async function ghostFetch<T>(
  resource: string,
  params: Record<string, string> = {}
): Promise<T> {
  const key = `${resource}?${new URLSearchParams(params)}`;
  const url = new URL(`${ghostOrigin()}/ghost/api/content/${resource}/`);
  url.search = new URLSearchParams({ key: GHOST_CONTENT_API_KEY, ...params }).toString();

  try {
    const res = await fetch(url, {
      headers: { "Accept-Version": "v6.0" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      throw new Error(`Ghost ${resource}: ${res.status} ${await res.text()}`);
    }
    const body: T = await res.json();
    remember(key, body);
    return body;
  } catch (err) {
    if (lastGood.has(key)) {
      console.warn(`Ghost ${resource} failed, serving the last good response:`, String(err));
      return lastGood.get(key) as T;
    }
    throw err;
  }
}
