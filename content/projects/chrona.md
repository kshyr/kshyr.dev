---
title: "chrona"
slug: chrona
excerpt: "A Ratatui terminal app for tasks and time logging, with a pluggable TOML store and a client for TickTick's unofficial v2 web API."
date: 2025-06-15
tags: [Rust, Ratatui, TickTick, serde, TOML]
featured: false
links:
  - label: GitHub
    url: https://github.com/kshyr/chrona
---

chrona is a terminal app for managing tasks and, eventually, logging time against them. It is written in Rust 2024 edition on Ratatui 0.30 (an alpha release) and can pull tasks from TickTick. An earlier attempt in December 2024 was a web app, a Turborepo with Next.js and a small Go server. It didn't get far, and chrona started over in Rust in May 2025.

## How it works

The app loop draws a frame, blocks on the next crossterm event and dispatches it. Key events go to an open modal first, then the help overlay, then global keys, then the active page.

- **Pages and widgets.** A `PageManager` owns four pages (Home, Planning, Focus, Stats) and a navbar. Each page keeps its own state and cycles focus between its widgets. The task list handles `j`/`k`, add, edit, delete and select, and the task form is a modal.
- **Toasts.** A `StatusMessage` carries a color and an expiry (five seconds by default) and renders only while it's still valid. The loop blocks on input, so a toast actually disappears on the first redraw after it expires, usually the next keypress.
- **Storage.** A `Store` trait (load, save, append, update, delete) sits in front of persistence. The only implementation is `TomlStore`, which keeps `tasks.toml` in the data directory and seeds example tasks on first launch. Every mutation is a read-modify-write of the whole file, which is fine at personal scale.
- **Directories.** Data, cache and state dirs come from the `directories` crate, which means XDG paths on Linux and platform conventions elsewhere. Each can be overridden with `CHRONA_DATA_DIR`, `CHRONA_CACHE_DIR` or `CHRONA_STATE_DIR`. Each run writes a timestamped `tracing` log to the state dir.

## The TickTick client

My first attempt used TickTick's official Open API with OAuth (`oauth2` plus `webbrowser` to open the consent page). A week later I replaced it with a client for the v2 API at `api.ticktick.com/api/v2`, the one the web app talks to:

- **Login.** `user/signon` with username and password, sending the same `x-device` and `User-Agent` headers a browser would. The client collects the `Set-Cookie` headers from the ureq 3 response, de-duplicates them by name, and replays them as a single `Cookie` header on later requests.
- **Sync.** One `GET batch/check/0` returns the inbox ID, projects, project groups, tags and tasks in a single payload. The response is cached as pretty-printed `batch_data.json`, which makes it easy to inspect when deserialization breaks.
- **Creating tasks.** `POST batch/task` with an add/update/delete payload. New tasks get a client-generated 24-character hex ID, shaped like the IDs the API returns.
- **serde work.** TickTick's numeric codes (status `-1`/`0`/`1`/`2`, priority `0`/`1`/`3`/`5`) are modeled as enums with serde renames. A generic deserializer turns empty strings into `None`; it's applied to a project's `viewMode`, which otherwise fails to parse as an enum. A custom serializer writes timestamps as `2025-06-15T12:00:00.000+0000`, with milliseconds and no colon in the offset, which is not chrono's default RFC 3339 output.

TickTick tasks are then mapped into chrona's own `Task`.

## Status

It is a work in progress:

- It targets `ratatui 0.30.0-alpha.4`, so APIs can still shift under it.
- Focus and Stats render "Not implemented yet" placeholders, and there is no time logging yet.
- Startup requires `TICKTICK_USERNAME` and `TICKTICK_PASSWORD` and lists TickTick tasks, but the form still writes to the TOML store. The two sources aren't reconciled.
- The client still creates a "Hi from Chrona" test task on every launch, and the time zone for new tasks is hardcoded.
- The v2 API is undocumented and can change without notice.
