# kshyr.dev

Personal site: [Astro](https://astro.build) server-rendered on Node, content in
a self-hosted [Ghost](https://ghost.org) used as a headless CMS.

Pages read Ghost's Content API on every request (no build-time content), so
edits in Ghost are live immediately and the Docker image builds without Ghost.
If Ghost is slow (3 s) or down, each page falls back to the last response it
got for the same query, so an outage serves slightly stale pages; a page not
served since the process started shows the 500 page, and uploads answer 502.
Pages ship as HTML; JavaScript only enhances (the home intro animation uses
`framer-motion/dom`).

## SEO

- Server-rendered content with real links, one `h1` per page, `<time>`,
  breadcrumbs.
- Canonical URLs, Open Graph and Twitter cards (Ghost's per-post meta title,
  meta description and OG image win when set), JSON-LD (`Person`, `WebSite`,
  `BlogPosting`, `SoftwareSourceCode`/`CreativeWork`, `BreadcrumbList`).
- Generated 1200×630 social images at `/og/site.png` and
  `/og/{project,blog}/<slug>.png`.
- `/sitemap.xml` (with `lastmod`), `/rss.xml`, `/robots.txt`.
- The canonical origin comes from `SITE_URL` at build time (default
  `https://kshyr.dev`).

## Preview features

Off unless set (in `.env.local` for development, or the container
environment):

- `SHOW_IDEAS=true` shows concepts (posts with the internal tag `#idea`, seeded
  from `content/ideas/`): unbuilt project and post ideas, always badged
  "Concept — not built yet" and `noindex`.

## Intro animation

`IntroGate` (inline in `<head>`) plays a page's intro only if the visitor
hasn't seen that page in the last 30 minutes and doesn't prefer reduced
motion. Otherwise, and without JavaScript, content is simply visible.

## Content model

Ghost has no custom fields, so the site maps its content onto Ghost conventions:

| Site concept         | In Ghost                                                     |
| -------------------- | ------------------------------------------------------------ |
| Blog post            | A post                                                       |
| Project              | A post with the internal tag `#project`                      |
| Description          | The post's **Excerpt** (Post settings)                       |
| Tags                 | Public tags (internal `#…` tags are never shown)             |
| Featured on home     | **Feature this post** toggle (top 3 projects, top 1 post)    |
| GitHub / Live / dev.to buttons | **Button cards at the very top of the post body**  |

Leading button cards are lifted out of the body and rendered as header buttons;
the icon is picked from the URL (github.com, dev.to, anything else). Button
cards further down render inline. Ordering is by publish date, newest first.

Uploaded images/media/files are served through the site at `/content/*`
(proxied from Ghost), so Ghost never needs to be publicly reachable.

## Local development

Requires Docker, Node 24 and pnpm 8.

```sh
pnpm install
cp .env.example .env.local    # set GHOST_ADMIN_EMAIL
pnpm ghost:up                 # Ghost 6 + MySQL 8 on http://localhost:2368
pnpm ghost:setup              # creates owner + integration, writes keys to .env.local
pnpm ghost:seed               # imports content/ into Ghost
pnpm dev                      # http://localhost:4321
```

- Ghost Admin: http://localhost:2368/ghost/ (owner password is in `.env.local`
  if `ghost:setup` generated it).
- `ghost:setup` is idempotent. On an already set up Ghost it needs
  `GHOST_ADMIN_PASSWORD`.
- `ghost:seed` skips posts whose slug already exists; `pnpm ghost:seed --update`
  overwrites them from the files. After seeding, Ghost is the source of truth;
  `content/` is only the initial import.
- `pnpm ghost:down` stops the containers (data stays in Docker volumes).

### Seed file format

`content/projects/*.md` and `content/blog/*.md` (concepts: `content/ideas/{projects,blog}/*.md`):

```md
---
title: "Title"
slug: title
excerpt: "Shown on cards and lists."
date: 2026-10-07
tags: [Rust, Ratatui]
featured: false
links:
  - label: GitHub
    url: https://github.com/kshyr/...
---

Markdown body (no H1; the page renders the title).
```

Images go in `content/images/` and are referenced relatively
(`![alt](../images/shot.png)`); the seed uploads them to Ghost (GIFs as files,
since Ghost re-encodes images and fails on long animations) and points the post
at the upload. Each `--update` run uploads them again.

## Environment

| Variable                | Used by       | Notes                                              |
| ----------------------- | ------------- | -------------------------------------------------- |
| `GHOST_URL`             | site, scripts | Where the site reaches Ghost; can be private        |
| `GHOST_CONTENT_API_KEY` | site          | Read-only key of the "kshyr.dev site" integration  |
| `GHOST_ADMIN_API_KEY`   | scripts       | Never give this to the site                        |
| `GHOST_ADMIN_EMAIL` / `GHOST_ADMIN_PASSWORD` | `ghost:setup` |                               |

`compose.yaml` additionally reads `GHOST_ADMIN_URL` (the URL you open Ghost Admin
on, e.g. a tailnet hostname), `GHOST_BIND`/`GHOST_PORT`, `GHOST_DB_PASSWORD`,
`GHOST_DB_ROOT_PASSWORD`, `GHOST_DEVICE_VERIFICATION`, `SITE_IMAGE`,
`SITE_BIND`/`SITE_PORT`. See `.env.example`.

## Deployment

CI builds a `linux/arm64` image of the standalone Astro server on pushes to
`astro` and publishes it to `ghcr.io/<owner>/<repo>` with the tags
`sha-<short>` and `latest` (`.github/workflows/image.yml`). The image needs
`GHOST_URL` and `GHOST_CONTENT_API_KEY` at runtime (optionally `SHOW_IDEAS`)
and only `SITE_URL` at build time.

`compose.yaml` works as a single stack (e.g. in Komodo):

- **Ghost and site on the same host:** `docker compose --profile site up -d`.
  The site talks to `http://ghost:2368` over the compose network; Ghost's port
  stays bound to `127.0.0.1` (reach the admin via the tailnet / SSH tunnel and
  set `GHOST_ADMIN_URL` accordingly).
- **Ghost elsewhere in the tailnet:** run the stack without the `site` profile
  on the Ghost host with `GHOST_BIND` set to its tailnet IP, and run the site
  image on the web host with `GHOST_URL=http://<ghost-host>:2368`. The web host
  must be on the tailnet.

Set real values for `GHOST_DB_PASSWORD` and `GHOST_DB_ROOT_PASSWORD` before the
first `up`; MySQL only reads them when it initialises its volume. Back up the
`ghost-db` and `ghost-content` volumes.

Staff device verification (an emailed code on new-device logins) is off by
default because no mail transport is configured; set
`GHOST_DEVICE_VERIFICATION=true` after configuring mail
(`mail__transport` etc., see Ghost's configuration docs).
