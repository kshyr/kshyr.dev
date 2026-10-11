---
title: "vitals-sink"
slug: vitals-sink
excerpt: "A small self-hosted pipeline that will collect Core Web Vitals from real visitors, store them in SQLite and show p75 per route and release."
date: 2026-10-07
tags: [Core Web Vitals, Go, SQLite, Observability, Docker]
featured: false
---

## The idea

vitals-sink is a small real-user-monitoring pipeline for Core Web Vitals that I host myself. A short client snippet uses the attribution build of the `web-vitals` library to collect LCP, INP and CLS, plus TTFB, and sends them with `navigator.sendBeacon` when the page is hidden. A Go service validates the payloads and writes them to SQLite. A dashboard shows the 75th percentile per metric, route, device class and deploy version, and which element or interaction was responsible for slow values.

I'll run it for my own site first, on the same Oracle Cloud arm64 VM that hosts the portfolio, with the image built in GitHub Actions and pushed to GHCR like the rest of my stack.

## Why it's worth building

Teams that take performance seriously talk in field data: p75 for real users, not one Lighthouse run on a fast laptop. Building the pipeline end to end shows I understand what the metrics mean and how they're attributed, and that I've handled the less visible parts that make the numbers trustworthy: sampling, batching, bot filtering and privacy. It also gives me real numbers for my portfolio's move to Astro instead of lab scores alone. The ingest side is Go and Docker, which I already ship in envpoint and pact.

## Scope

MVP:

- Client snippet: attribution build, configurable sample rate, beacon on `visibilitychange`, a deploy version tag
- Go ingest endpoint with schema validation, a payload size limit and per-IP rate limiting; no cookies, no IP addresses stored
- SQLite schema with one row per metric event, plus daily rollups
- Dashboard: p75 and distribution per metric, route, device class and version; most common LCP elements and INP targets
- A retention job that deletes raw events after a configurable number of days
- Multi-arch Docker image, a compose file and a short privacy note for the site

Non-goals:

- Sessions, funnels or anything that turns into product analytics
- Hosting it for other people's sites
- ClickHouse in the first version. SQLite stays until the data says otherwise.

## Milestones

1. Client snippet and a Go endpoint that only logs to stdout; check the payloads in DevTools. One evening.
2. SQLite storage, rollups and retention, with tests for the percentile math against a dataset where I know the answers. A weekend.
3. Dashboard as server-rendered pages with small inline SVG charts and no heavy chart library. A weekend.
4. Deploy it on my VM, add the snippet to my site and leave it running for a few weeks.
5. Load-test the ingest endpoint with a synthetic replay to find what one small instance can take.

## What to measure / show

- A read-only dashboard for my own site, or screenshots if traffic is too low to say much. I'll state the sample size next to every number.
- Snippet size gzipped, and confirmation that it doesn't show up in my own INP attribution.
- Ingest throughput and p99 latency on the arm64 VM from the load test, with the test script in the repo.
- Storage used per million events in SQLite.
- One change to my site that came from the data, if the data points at one. If it doesn't, I'll say that instead.
