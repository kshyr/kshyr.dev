import { randomBytes } from "node:crypto";
import { adminApi, ghostUrl, saveEnv, waitForGhost } from "./ghost-admin.mjs";

const INTEGRATION = "kshyr.dev site";
const email = process.env.GHOST_ADMIN_EMAIL;
if (!email) {
  console.error("Set GHOST_ADMIN_EMAIL (in .env.local or the environment).");
  process.exit(1);
}

console.log(`Waiting for Ghost at ${ghostUrl}…`);
await waitForGhost();

const {
  setup: [{ status: isSetUp }],
} = await adminApi("authentication/setup/");

if (!isSetUp) {
  const password = process.env.GHOST_ADMIN_PASSWORD || randomBytes(18).toString("base64url");
  await adminApi("authentication/setup/", {
    method: "POST",
    body: {
      setup: [{ name: "Kostiantyn Shyrolapov", email, password, blogTitle: "kshyr.dev" }],
    },
  });
  saveEnv({ GHOST_ADMIN_EMAIL: email, GHOST_ADMIN_PASSWORD: password });
  console.log(`Created Ghost owner ${email}; password saved to .env.local.`);
} else if (!process.env.GHOST_ADMIN_PASSWORD) {
  console.error("Ghost is already set up. Set GHOST_ADMIN_PASSWORD to its owner password.");
  process.exit(1);
}

const session = await adminApi("session/", {
  method: "POST",
  body: { username: email, password: process.env.GHOST_ADMIN_PASSWORD },
});
const cookie = session.headers
  .getSetCookie()
  .map((c) => c.split(";")[0])
  .join("; ");
const auth = { cookie };

// Ghost's "?ref=" tagging would leak its private hostname into outbound links.
await adminApi("settings/", {
  method: "PUT",
  body: { settings: [{ key: "outbound_link_tagging", value: false }] },
  auth,
});

if (!isSetUp) {
  const sample = await adminApi("posts/slug/coming-soon/", { auth });
  if (sample) await adminApi(`posts/${sample.posts[0].id}/`, { method: "DELETE", auth });
}

const { integrations } = await adminApi("integrations/?include=api_keys&limit=all", { auth });
let integration = integrations.find((i) => i.name === INTEGRATION);
if (!integration) {
  ({
    integrations: [integration],
  } = await adminApi("integrations/?include=api_keys", {
    method: "POST",
    body: { integrations: [{ name: INTEGRATION, description: "Next.js frontend and seed scripts" }] },
    auth,
  }));
  console.log(`Created integration "${INTEGRATION}".`);
}

const key = (type) => integration.api_keys.find((k) => k.type === type);
const admin = key("admin");
saveEnv({
  GHOST_URL: ghostUrl,
  GHOST_CONTENT_API_KEY: key("content").secret,
  GHOST_ADMIN_API_KEY: admin.secret.includes(":") ? admin.secret : `${admin.id}:${admin.secret}`,
});
console.log("Wrote GHOST_URL, GHOST_CONTENT_API_KEY and GHOST_ADMIN_API_KEY to .env.local.");
console.log(`Ghost Admin: ${ghostUrl}/ghost/`);
