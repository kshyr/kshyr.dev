import { createHmac } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { basename, extname } from "node:path";
import { fileURLToPath } from "node:url";

export const ENV_FILE = new URL("../.env.local", import.meta.url);

if (existsSync(ENV_FILE)) process.loadEnvFile(ENV_FILE);

export const ghostUrl = (process.env.GHOST_URL ?? "http://localhost:2368").replace(/\/$/, "");
const ACCEPT_VERSION = "v6.0";

export function saveEnv(values) {
  let text = existsSync(ENV_FILE) ? readFileSync(ENV_FILE, "utf8") : "";
  for (const [key, value] of Object.entries(values)) {
    const line = `${key}=${value}`;
    const pattern = new RegExp(`^${key}=.*$`, "m");
    text = pattern.test(text) ? text.replace(pattern, line) : `${text.replace(/\n?$/, "\n")}${line}\n`;
    process.env[key] = value;
  }
  writeFileSync(ENV_FILE, text.replace(/^\n/, ""), { mode: 0o600 });
}

export async function waitForGhost(timeoutMs = 180_000) {
  const deadline = Date.now() + timeoutMs;
  while (true) {
    try {
      const res = await fetch(`${ghostUrl}/ghost/api/admin/site/`);
      if (res.ok) return;
    } catch {}
    if (Date.now() > deadline) throw new Error(`Ghost at ${ghostUrl} did not come up`);
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}

function base64url(value) {
  return Buffer.from(typeof value === "string" ? value : JSON.stringify(value)).toString("base64url");
}

export function adminToken(adminKey) {
  const [id, secret] = adminKey.split(":");
  const iat = Math.floor(Date.now() / 1000);
  const unsigned = `${base64url({ alg: "HS256", typ: "JWT", kid: id })}.${base64url({ iat, exp: iat + 300, aud: "/admin/" })}`;
  const signature = createHmac("sha256", Buffer.from(secret, "hex")).update(unsigned).digest("base64url");
  return `${unsigned}.${signature}`;
}

export async function adminApi(path, { method = "GET", body, auth } = {}) {
  const headers = { "Accept-Version": ACCEPT_VERSION, Origin: ghostUrl };
  if (auth?.adminKey) headers.Authorization = `Ghost ${adminToken(auth.adminKey)}`;
  if (auth?.cookie) headers.Cookie = auth.cookie;
  if (body) headers["Content-Type"] = "application/json";

  const res = await fetch(`${ghostUrl}/ghost/api/admin/${path}`, {
    method,
    headers,
    body: body && JSON.stringify(body),
  });
  if (res.status === 404 && method === "GET") return null;
  if (!res.ok) {
    throw new Error(`${method} ${path}: ${res.status} ${await res.text()}`);
  }
  const isJson = res.headers.get("content-type")?.includes("application/json");
  return Object.assign(isJson ? await res.json() : {}, { headers: res.headers });
}

const IMAGE_TYPES = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
};

// GIFs go in as plain files: Ghost re-encodes images and fails on long animations.
export async function uploadImage(file, { adminKey }) {
  const path = file instanceof URL ? fileURLToPath(file) : file;
  const type = IMAGE_TYPES[extname(path).toLowerCase()];
  if (!type) throw new Error(`upload ${basename(path)}: not an image type Ghost accepts`);
  const asFile = type === "image/gif";
  const body = new FormData();
  body.set("file", new Blob([readFileSync(path)], { type }), basename(path));
  if (!asFile) body.set("purpose", "image");
  body.set("ref", basename(path));
  const res = await fetch(`${ghostUrl}/ghost/api/admin/${asFile ? "files" : "images"}/upload/`, {
    method: "POST",
    headers: { "Accept-Version": ACCEPT_VERSION, Origin: ghostUrl, Authorization: `Ghost ${adminToken(adminKey)}` },
    body,
  });
  if (!res.ok) throw new Error(`upload ${basename(path)}: ${res.status} ${await res.text()}`);
  const { images, files } = await res.json();
  return (images ?? files)[0].url;
}
