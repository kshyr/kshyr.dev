---
title: "Core Web Vitals before and after moving my portfolio to Astro"
slug: core-web-vitals-nextjs-to-astro
excerpt: "A plan to measure my portfolio's Core Web Vitals before and after the move to Astro, with one method, repeated runs and the raw data."
date: 2026-10-07
tags: [Core Web Vitals, Astro, Next.js, Performance]
featured: false
---

## The idea

My portfolio currently renders with Next.js and reads content from Ghost, and I'm moving it to Astro. Most migration posts report one Lighthouse score before and one after. This post would fix a measurement method first, take a baseline on the Next.js site while it still runs on the same infrastructure, and then report the same measurements on Astro with the spread across runs, not just a single number.

It also has to separate the framework from everything else that changes in a migration. If I also redo images or fonts during the move, that's not Astro's doing, and the post should say which change moved which metric. If the numbers barely move, that's the post.

## Why it's worth writing

Framework migrations at work come with a cost and a question: was it worth it? A post that sets up a fair comparison, controls for confounders and reports variance shows how I'd answer that question for a team. Performance-focused frontend roles look for exactly this: knowing the difference between lab and field data, and not overclaiming from a small sample.

## Outline

- What I measured and why: LCP, INP, CLS and TTFB, plus JavaScript bytes, HTML size and request count
- Lab vs field: what each tells you, and why a low-traffic site mostly has to rely on lab data
- The setup: a fixed list of pages, a fixed throttling profile, a set number of runs per page, median and spread
- Baseline on Next.js
- What changed in the migration, and what I deliberately kept the same
- Results on Astro, per page type: home, project page, blog post
- Field data from my own RUM, or an honest note on how little there is
- What didn't change, and why
- Was it worth it

## What I need first

- Baseline runs on the current Next.js site on the production VM, before the Astro version replaces it. This part is time-sensitive.
- A script that runs Lighthouse a fixed number of times per page with the same settings and saves the JSON, committed so the "after" runs use exactly the same code.
- A record of every content, image, font and infrastructure change made during the migration.
- The Astro version deployed on the same VM behind the same reverse proxy, so hosting isn't a variable.
- Ideally vitals-sink (see the project concept) running on the Next.js site for a few weeks before the switch, so there's some field data on both sides.

## What to measure / show

- Median and spread for each metric per page type, before and after.
- JavaScript bytes transferred and request count per page.
- Field p75 values with the sample size next to them, if there's enough traffic to report anything.
- Links to the raw JSON and the measurement script so the numbers can be checked.
- Docker image size and build time as a short side note.
