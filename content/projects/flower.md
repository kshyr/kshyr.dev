---
title: "flower"
slug: flower
excerpt: "A Go time tracker that started as a SQLite-backed terminal app and became a Wails desktop shell with a signed macOS release pipeline."
date: 2024-09-27
tags: [Go, Wails, React, SQLite, GitHub Actions]
featured: false
links:
  - label: GitHub
    url: https://github.com/kshyr/flower
---

flower started in August 2024 as a terminal time tracker in Go: named timers with log entries attached to them, stored locally in SQLite. In September I restructured it into two binaries, a Wails v2 desktop app and a CLI, and spent most of the following week getting the desktop app built and signed in GitHub Actions.

## The CLI version

The first version was all about the storage layer:

- **SQLite under XDG.** The database file lives at `$XDG_DATA_HOME/flower/flower.db`, resolved with `adrg/xdg`. With `FLDEBUG=1` it uses a separate `flower.debug.db` and drops and recreates the tables on every start, so debugging never touches real data.
- **Embedded SQL.** Queries live in `.sql` files with named blocks (`--name: add-timer`) and are compiled into the binary with `//go:embed`, then loaded by name through `dotsql`. The binary has no runtime file dependencies, and the SQL stays readable as SQL.
- **Two tables.** `timers` (name, duration) and `logs` (message, foreign key to a timer). Each table implements a small `Tabler` interface (`CreateTable`, `TableExists`, `DropTable`), so startup creates whatever is missing.
- **Config.** A TOML file under `$XDG_CONFIG_HOME`, seeded with the first name of the OS user.

A design doc sketched a console-driven TUI (`time 1h 30m`, `pause`, `break`, `log list`) on Bubble Tea. The UI never got past a skeleton, but the storage layer and a goreleaser workflow shipped as v0.1.0.

## The rewrite

The September rewrite split the repo into `desktop/` and `cli/`, and later moved everything under a single root `go.mod`.

The desktop app is Wails v2: a Go backend that embeds the built frontend (`//go:embed all:frontend/dist`), and a React + TypeScript + Vite frontend with shadcn/ui components on Radix, Tailwind with CSS variables for theming, a dark mode toggle and Recharts. On macOS the window uses a hidden inset title bar with a transparent webview, and the HTML body is marked as a drag region, so the app has no visible chrome.

## Release pipeline

Pushing a `flower/v*` tag runs a macOS workflow. It imports a `.p12` certificate from secrets into the runner's keychain, builds `darwin/amd64` and `darwin/arm64` separately with Wails, signs each `.app` with `gon`, packages them as DMGs with `appdmg`, and publishes a release with `gh release create`. Getting there took 25 commits titled `ci: macos signing(n)`. A small script generated most of those commits: it bumped the counter, committed, waited for the push and then pushed a new dev tag. The notarization step is written but commented out, because the certificate in use is a development certificate, not a Developer ID. I [wrote that story up separately](/blog/signing-a-wails-app-in-ci).

## Status

flower is a shell more than a product right now, and the last commit was in late September 2024:

- The desktop dashboard renders hardcoded mock data. The only Go binding is the template's `Greet`, so the Go side doesn't feed the UI anything yet.
- The `cli/` binary is an empty `main`. The SQLite timers and logs from the first version weren't carried over into the new layout.
- macOS builds are signed but not notarized, so Gatekeeper on another machine won't open them without complaint.
