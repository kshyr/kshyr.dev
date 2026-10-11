---
title: "axe-diff"
slug: axe-diff
excerpt: "A GitHub Action that will run axe-core on a pull request and its base branch, and comment only on the accessibility violations the PR adds."
date: 2026-10-07
tags: [Playwright, Accessibility, axe-core, GitHub Actions]
featured: false
---

## The idea

axe-diff is a GitHub Action for frontend repos. On every pull request it builds the head and the base branch, visits a configured list of routes with Playwright, runs axe-core on each page and compares the two result sets. The PR comment lists only what changed: violations the PR introduces, violations it fixes, and a count of the ones that were already there.

The comparison is the part I care about. When axe is added to an existing codebase, it usually starts with a backlog of violations, so a plain pass/fail check either fails every PR for reasons unrelated to it or gets switched off. Reporting the difference against the base branch makes the check useful on the first day, without a cleanup project first.

Each violation gets a fingerprint from the route, the axe rule ID and a normalized target selector, so the same issue on both branches matches even when generated class names or element order shift.

## Why it's worth building

Frontend platform and design-system teams care about two things here: accessibility that doesn't regress quietly, and CI checks that developers don't learn to ignore. A tool that reports a precise delta with few false positives shows I think about both. It fits what my site says I care about, making things accessible, and it's something other people can install and use, not only read about.

It's also close to my everyday work. I write React and Next.js, and Playwright in CI is exactly where I'd put this at any job.

## Scope

MVP:

- Config file with routes, viewports and optional setup steps per route (log in, open a menu, switch a theme)
- `@axe-core/playwright` runs on base and head builds, filtered by WCAG tags
- Fingerprinting and diffing of violations, with axe's `incomplete` results reported separately
- One PR comment, updated in place, grouped by rule and impact, linking to the rule docs
- The check fails only on new `serious` or `critical` violations by default, configurable
- JSON output of the diff so other tools can use it
- A fixture repo with intentionally broken PRs that serves as the Action's own test suite

Non-goals:

- Replacing manual testing. Automated rules catch only part of WCAG failures; keyboard and screen-reader checks still need a person, and the comment will say so.
- A hosted dashboard or history across runs.
- Crawling. Routes are listed explicitly.

## Milestones

1. A script that runs axe on a list of URLs and writes normalized JSON. One evening.
2. Fingerprinting and diff logic, with unit tests built from real axe output, including selectors that change between builds. A weekend.
3. The Action itself: build both refs, start servers, run, post or update the comment. A weekend.
4. The fixture repo, with PRs that remove a label, break contrast and fix an existing issue, so the expected comments are asserted in CI. One or two evenings.
5. Publish to the GitHub Marketplace, write the README, and run it on this site's repo and one other real repo.

## What to measure / show

- A real PR on a public repo with the bot's comment, linked from the page.
- CI time added for a typical config of about ten routes on GitHub-hosted runners.
- Fingerprint stability: run the same commit twice, and run across a refactor that only renames classes, then report how many violations matched. The goal I'll hold it to is zero spurious "new" violations, and I'll publish the number either way.
- The fixture repo's CI results as evidence that the diff is correct.
- The Marketplace listing and the README with a copy-paste setup.
