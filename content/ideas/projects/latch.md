---
title: "latch"
slug: latch
excerpt: "A headless React library that will ship four accessible primitives, tested by keyboard in three browser engines and by hand with screen readers."
date: 2026-10-07
tags: [React, Accessibility, Design Systems, Playwright]
featured: false
---

## The idea

latch is a small headless React library with four primitives that are easy to get wrong: a combobox, a modal dialog, a menu button and tabs. Each follows its WAI-ARIA Authoring Practices pattern, ships as hooks plus unstyled components, and has a docs page with a keyboard map, the ARIA attributes involved and notes from manual screen-reader testing.

It isn't meant to compete with Radix or React Aria, and the README will say so. The point is to build four components to a standard I can show: keyboard behavior tested in real browsers, screen-reader behavior written down with versions, and visual regression tests on an example theme.

## Why it's worth building

Design-system and frontend platform teams look at component API design (controlled and uncontrolled state, composition, ref forwarding, SSR-safe IDs), accessibility semantics and testing in real browsers. Most portfolios show finished apps; few show a component worked through down to focus management and what a screen reader announces. It ties directly to the "accessible" part of my site's tagline and to the React work I do every day.

## Scope

MVP:

- Combobox (list autocomplete), dialog, menu button and tabs
- Controlled and uncontrolled APIs, SSR-safe IDs and typed props
- Playwright keyboard tests in Chromium, Firefox and WebKit, written from the keyboard tables in the APG patterns
- axe checks on every docs example
- Visual regression with Playwright screenshots of an example Tailwind theme in light, dark and forced-colors modes
- A manual test log for VoiceOver on macOS and NVDA on Windows, kept in the repo next to the code
- A docs site, an npm package and the bundle size of each primitive

Non-goals:

- A styled component library or theming system
- More primitives before these four are solid
- React versions older than 18

## Milestones

1. Tabs and dialog with keyboard tests. A weekend; these are the warm-up.
2. Menu button, including typeahead and returning focus to the trigger. One or two evenings.
3. Combobox, which will take the longest: `aria-activedescendant`, filtering, async options and live announcements. At least a weekend.
4. Docs site with live examples, keyboard maps and the screen-reader log. A weekend.
5. Visual regression in CI, an npm release and size reporting on each PR.

## What to measure / show

- The docs URL and the npm package.
- The test matrix across three browser engines, green in CI.
- The screen-reader log with screen reader and browser versions, including what doesn't work yet.
- Gzipped bundle size per primitive.
- A short recording of the combobox used with only a keyboard and with VoiceOver.
