---
title: "chrona sync"
slug: chrona-sync
excerpt: "A local-first sync layer that will let chrona and a small offline web app share the same tasks and time logs through a CRDT document."
date: 2026-10-07
tags: [Rust, Local-first, CRDT, Automerge, PWA]
featured: false
---

## The idea

chrona keeps tasks in a TOML store and can pull from TickTick, but it only lives in one terminal on one machine. I'd add an Automerge-backed store so tasks and time entries live in a CRDT document on each device, and build a small installable web app that reads and writes the same document offline. Devices exchange changes through a sync server I host; it relays and stores changes, but it isn't the source of truth.

Automerge has a Rust crate and a JavaScript package built from the same Rust core, so the terminal app and the web app share one document format instead of two implementations I'd have to keep in step by hand.

## Why it's worth building

Product teams building offline-capable or collaborative apps, such as note-taking, field tools or editors, need engineers who understand what happens when two devices edit the same thing while disconnected. Showing the conflict cases, the document schema and a migration plan is a stronger signal than "uses a sync library". The project joins my Rust TUI work with the React and TypeScript I use at work, and I'd use it every day, which keeps it honest.

## Scope

MVP:

- An Automerge store behind chrona's existing store interface, with TOML import and export kept
- A document schema for tasks and time entries, with a version field and a written migration path
- A sync server on my VM, deployed like the rest of my stack and reachable over my tailnet
- A web app with a task list and a start/stop timer, working offline through a service worker and IndexedDB
- Conflict scenarios written as tests: concurrent edits to the same title, a timer started on two devices, delete against edit
- A visible "last synced" state in both apps

Non-goals:

- Sharing between users, or permissions
- Replacing the TickTick integration; it stays a one-way import
- End-to-end encryption in the first version. It's a noted follow-up; the server is only reachable on my tailnet for now.

## Milestones

1. Spike: edit the same Automerge document from a Rust test and a Node test, merge, compare. One evening.
2. The store in chrona, with property tests that random edit sequences on two replicas always converge. A weekend.
3. The sync server, deployed through my existing Docker setup. One evening.
4. The web app with offline support and the timer. A weekend.
5. The conflict suite, plus a write-up of the cases where the merge is technically correct but not what I'd want as a user, and what I did about each. A weekend.

## What to measure / show

- A recording: phone in airplane mode, edits on both sides, reconnect, merged result.
- The convergence tests and the list of conflict scenarios with their expected outcomes.
- Document size after a month of my own real use, and whether compaction turned out to be necessary.
- Time for a change to reach the other device over the tailnet.
- Cold start time of the web app on a mid-range phone.
