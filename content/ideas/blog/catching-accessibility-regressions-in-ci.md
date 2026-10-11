---
title: "Catching accessibility regressions in CI"
slug: catching-accessibility-regressions-in-ci
excerpt: "How to add an accessibility check to CI that reports only what a PR changes, and how to cover what automated rules can't see."
date: 2026-10-07
tags: [Accessibility, Playwright, axe-core, CI]
featured: false
---

## The idea

A companion post to axe-diff that's useful even to people who never install it. The common failure with accessibility checks in CI is a check that's red on the first day: an existing codebase has a backlog of violations, every PR fails for reasons unrelated to it, and the check gets switched off. The post compares three ways out (fix everything first, commit a baseline file, or diff against the base branch), explains how to fingerprint violations so diffs stay stable, and is direct about what automated rules can't detect and how to cover some of that with keyboard tests and a short manual checklist.

## Why it's worth writing

Engineering managers look for people who can introduce a quality gate without slowing the team down or getting it ignored. This post is about that rollout problem as much as about accessibility, and it shows I've tried the approaches on real code instead of repeating a vendor's docs. It pairs with a tool people can use, which makes both more credible.

## Outline

- The failure mode: a check that fails every PR
- Three options, fix-first, committed baseline and base-branch diff, with their trade-offs
- Fingerprinting violations: rule, route, selector, and why generated class names break naive matching
- What automated rules cover and what they miss: focus order, whether labels make sense, what gets announced
- Playwright keyboard tests for the few flows that matter most
- Rolling it out on a team: warn-only first, then block on serious and critical issues
- What I'd do differently

## What I need first

- axe-diff working through at least its third milestone.
- Runs against two real codebases, my site and an open-source frontend, so the examples of noise and fingerprint failures are real.
- A replay over the last 20 or so merged PRs of that open-source repo, to see what the bot would have said on each.
- A rough committed-baseline implementation to compare against the diff approach.
- A few Playwright keyboard tests to use as examples.

## What to measure / show

- The number of existing violations in each repo tested.
- From the replay: how many PRs would have received a comment, how many comments pointed at a real new issue, and how many were noise.
- Spurious "new" violations caused by fingerprint mismatches.
- CI time added per run.
- A real example comment, linked.
