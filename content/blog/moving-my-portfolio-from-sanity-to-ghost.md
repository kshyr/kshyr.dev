---
title: "Moving my portfolio from Sanity to self-hosted Ghost"
slug: moving-my-portfolio-from-sanity-to-ghost
excerpt: "Swapping a hosted CMS for a Ghost instance I run myself, mapping my content onto Ghost without custom fields, and moving the frontend to Astro."
date: 2026-10-07
tags: [Ghost, Astro, Docker, Self-hosting]
featured: true
---

This site used to be a Next.js app reading its content from Sanity. It now reads it from a Ghost instance I run myself, next to the rest of my self-hosted stuff, and the frontend is Astro. Most of the work was deciding how to express my old content model in a CMS that doesn't let you define one.

## What the Sanity setup looked like

The old setup was the standard `next-sanity` starter, shaped around my content:

- four schemas: `project`, `post`, `tag`, and a singleton `featured` document holding references to the projects and posts shown on the home page
- post bodies were not rich text but markdown files uploaded as Sanity file assets, fetched at render time and compiled with `next-mdx-remote`
- Sanity Studio mounted inside the site at `/studio`

It worked, but every piece of it pulled in something I didn't want. The Studio route dragged `sanity`, `styled-components` and the Vision plugin into the app's dependency tree. Writing meant editing a markdown file locally and re-uploading it as an asset. And the content lived in someone else's cloud while the site itself had already moved to a standalone arm64 Docker image I host.

## Why Ghost

Ghost is a good editor that I can run as two containers. It has a Content API with a read-only key, so the site needs no admin credentials. And since Ghost 5 the editor is built on Lexical with cards for code blocks, images, bookmarks and buttons, which covers everything my posts use.

The cost is that Ghost has a fixed content model: posts, pages, tags, authors. No custom document types, no custom fields. So the migration is mostly a mapping exercise.

## Mapping the content model

**Projects vs. blog posts.** Both are Ghost posts. A project is a post carrying the internal tag `#project`. Internal tags (the `#` prefix) never show up on a Ghost theme, and the Content API can filter on them by slug:

```ts
// Projects are posts carrying the internal tag "#project" (slug
// "hash-project"); every other post is a blog post.
const PROJECT = "tag:hash-project";
const BLOG = "tag:-hash-project";
```

**Featured.** The singleton `featured` document goes away entirely. Ghost already has a "Feature this post" toggle, so the home page asks for `featured:true` in each bucket:

```ts
const [projects, posts] = await Promise.all([
  listPosts(`${PROJECT}+featured:true`, "3"),
  listPosts(`${BLOG}+featured:true`, "1"),
]);
```

**Description.** The `description` field becomes Ghost's custom excerpt, which the editor exposes in the post settings.

**Links.** This was the awkward one. Projects had `githubUrl` and `liveUrl`, posts had `devtoUrl`, and the page renders them as a row of buttons under the title. With no custom fields, I went with something that's visible and editable in the Ghost editor: button cards at the very top of the post. When the site renders a post, it lifts leading button cards out of the HTML and hands them to the header instead:

```ts
function liftLeadingButtons(links: PostLink[]) {
  return (tree: Root) => {
    while (tree.children.length > 0) {
      const node = tree.children[0];
      // ...skip whitespace...
      if (node.type !== "element" || !classes(node).includes("kg-button-card")) {
        break;
      }
      const anchor = node.children.find(
        (child): child is Element =>
          child.type === "element" && child.tagName === "a"
      );
      if (anchor?.properties?.href) {
        links.push({ label: textOf(anchor).trim(), url: String(anchor.properties.href) });
      }
      tree.children.shift();
    }
  };
}
```

The icon is picked from the URL's host (GitHub, dev.to, or a generic external-link icon), so the author only has to type a label. A button card further down the post is left alone and renders inline like any other card.

## Rendering

Post bodies now arrive as HTML instead of markdown, so `next-mdx-remote` and the MDX config are gone. The HTML goes through a small unified pipeline: `rehype-parse`, the button lifting above, a pass that rewrites Ghost-origin URLs, `rehype-highlight` for code blocks, and `rehype-stringify`. Ghost writes code blocks as `<pre><code class="language-rust">`, which is exactly what `rehype-highlight` expects, so the existing highlight.js theme kept working.

The upload rewrite exists because Ghost isn't public. Images uploaded in the editor are stored with absolute URLs on Ghost's own origin, which visitors can't reach. The renderer rewrites every URL on Ghost's origin to a site-relative one (which also keeps links between posts working), and an endpoint streams uploads from Ghost:

```ts
const upstream = await fetch(
  `${ghostOrigin()}/content/${parts.map(encodeURIComponent).join("/")}`,
  { headers: { "if-none-match": request.headers.get("if-none-match") ?? "" } }
);
```

Only `images`, `media` and `files` are proxied, and only a handful of response headers are forwarded.

## Reading content at request time

The old pages used ISR with a 60-second revalidate. That assumes the CMS is reachable while the image is being built, which it isn't when the image is built in GitHub Actions and Ghost sits on a private network. Every page is now rendered on request by Astro's Node server and queries Ghost directly. For a site this size, against a Ghost instance on the same network, that's cheap. It also means an edit in Ghost is live as soon as I hit Update, with no build and no cache to wait out.

The site's whole configuration is two environment variables, `GHOST_URL` and `GHOST_CONTENT_API_KEY`. They're declared with `astro:env` as server secrets, which Astro reads at runtime instead of inlining into the build, so the same image runs against a local Ghost on my laptop or the one on my server.

## And off Next.js

With content coming from Ghost, the Next.js app was mostly client components wrapped around HTML. The home page rendered nothing until a `localStorage` check ran in the browser, and the blog and project lists navigated with click handlers instead of links, so a crawler saw an empty home page and no way to reach the posts. Astro renders everything as HTML and ships JavaScript only where something moves: the home page intro, which still uses framer-motion through its DOM API and now only plays on a first visit, and a few lines for the skill tags' tilt. The interactive words that used to be framer-motion components are CSS now.

## Running Ghost

Ghost and MySQL 8 run from a `compose.yaml` in the repo. The same file has an optional `site` profile that runs the frontend next to them, which is how it deploys as a single stack. Ghost's port is bound to localhost by default; the site reaches it over the compose network.

One setting worth calling out: recent Ghost versions email a verification code when a staff user signs in from a new device. My instance has no mail transport, so that email would never arrive and I'd be locked out of my own admin. The compose file turns `security__staffDeviceVerification` off by default and leaves an environment variable to turn it back on once mail is configured.

## Bootstrapping without clicking through the UI

A fresh Ghost wants you to create an owner account in the browser, then create a custom integration to get API keys. Both steps go through the Admin API, so `pnpm ghost:setup` does them: it creates the owner if Ghost isn't set up yet, logs in with a session cookie, creates (or reuses) a "kshyr.dev site" integration, and writes the keys to `.env.local`. Running it twice is a no-op.

One surprise while writing it: the integration's admin key `secret` already comes back as the full `id:secret` string, so the usual pattern of joining `id` and `secret` produces a key with the id twice and a JWT Ghost rejects as having an invalid signature.

Content starts as markdown files in `content/`, imported by `pnpm ghost:seed` with `?source=html`. Ghost's HTML importer turns button-card markup and fenced code into real editor cards, so imported posts are indistinguishable from ones written in the editor. After the first import, Ghost is the source of truth and the markdown files are just the seed.

## What I gave up

- **Structured fields.** Links-as-button-cards is a convention, not a schema. Nothing stops a post from having its buttons in the wrong place.
- **Typed queries.** GROQ projections returned exactly the shape the components wanted. Now there's a small mapping layer from Ghost's post object.
- **Static pages.** Every page view is a Ghost query. That's a deliberate trade for instant edits and builds that don't depend on the CMS, but it does mean the site is only as available as Ghost.

In return, the content lives on infrastructure I control, the dependency tree is a lot smaller, and writing a post means opening an editor instead of uploading a markdown file.
