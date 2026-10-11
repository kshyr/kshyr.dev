import { imageSize } from "image-size";
import { ghostOrigin } from "./client";

const HEAD_BYTES = 128 * 1024;
const TIMEOUT_MS = 2000;
const RETRY_FAILED_MS = 5 * 60 * 1000;
const MAX_CACHED = 1000;

type Size = { width: number; height: number };
const known = new Map<string, Size | { failedAt: number }>();

async function measure(path: string): Promise<Size | null> {
  const cached = known.get(path);
  if (cached && "width" in cached) return cached;
  if (cached && Date.now() - cached.failedAt < RETRY_FAILED_MS) return null;

  try {
    const res = await fetch(`${ghostOrigin()}${path}`, {
      headers: { Range: `bytes=0-${HEAD_BYTES - 1}` },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`${res.status}`);
    const { width, height } = imageSize(new Uint8Array(await res.arrayBuffer()));
    if (!width || !height) throw new Error("no size");
    if (known.size >= MAX_CACHED) known.delete(known.keys().next().value!);
    known.set(path, { width, height });
    return { width, height };
  } catch {
    known.set(path, { failedAt: Date.now() });
    return null;
  }
}

export async function uploadSizes(paths: string[]) {
  const unique = [...new Set(paths)];
  const sizes = await Promise.all(unique.map(measure));
  return new Map(unique.flatMap((path, i) => (sizes[i] ? [[path, sizes[i]] as const] : [])));
}
