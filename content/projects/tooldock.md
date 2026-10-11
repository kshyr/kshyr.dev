---
title: "ToolDock"
slug: tooldock
excerpt: "Turns tldr-pages examples for the commands installed on my machine into a hand-picked set of MCP tools, with SQLite as the execution truth."
date: 2026-09-11
tags: [Python, MCP, SQLite, CLI]
featured: true
---

## What it is

ToolDock gives an MCP client a short, reviewed list of concrete things it may run on my machine, such as `ollama.list` or `docker.compose.up`, instead of a shell. It finds the executables on my `PATH`, looks up their tldr-pages entries, and compiles each example into an Action: an ID, a typed input schema and one or more argv templates. Every new Action starts disabled. I pick the ones I want in a terminal UI, and only those get served.

## How it works

The pipeline is short on purpose:

- **Discovery.** Scan `PATH` for executables, download the tldr archive into a cache, and keep only the pages (from `common` and the current platform) whose root command is actually installed.
- **Compilation.** Each example becomes an Action ID taken from the subcommand path, a set of parameter specs and an argv template. Examples that need a shell (pipes, redirects, `&&`, `;`, command substitution) are dropped. Examples that compile to the same ID are merged into one Action with several templates. I wrote up the compiler [in a separate post](/blog/tldr-pages-to-mcp-tools).
- **Storage.** SQLite holds the Actions. Rescans keep whatever I enabled, and each Action also stores the absolute executable path it was discovered with, so an MCP host with a different `PATH` runs the same binary.
- **Selection.** A prompt-toolkit TUI with Programs, Actions and Details panes and an htop-style live filter. A Program works as a bulk gate: pausing `ollama` hides all of its Actions and remembers which ones were selected.
- **Serving.** The official MCP Python SDK over stdio or Streamable HTTP. The HTTP process binds to loopback only and also serves a small REST API with an OpenAPI document. Both take structured inputs only and never raw commands or argv. `tools/list` reads SQLite on every request, so enabling an Action takes effect without a restart. `tooldock mcp --check` starts a fresh stdio child with the SDK client and checks that its `tools/list` matches the CLI preview.

## Design decisions

**Execution columns are off-limits to enrichment.** Descriptions, aliases, ordering, groups, tags and explicit danger markers can come from argc-completions, a legacy Fig snapshot, cheat/cheatsheets, static Carapace YAML, Codex's clap declarations and installed `--help` output. The enrichment loader only accepts an allow-list of presentation fields. It can't change templates, executable paths, selection or MCP exposure. It keeps every candidate with its source and revision, so `tooldock enrich compare` shows what each provider offered and which value won.

**External sources are data, never code.** Completion specs are parsed as inert text. Dynamic generators, computed values and shell snippets are skipped, not evaluated. When ToolDock does run an installed binary for `--help`, it calls it directly with a timeout and no shell. Danger works the same way: an Action is marked dangerous only when a source says so explicitly. `rm` isn't flagged because of its name, and a missing marker doesn't mean safe.

**argv, not a shell.** Templates render to a list of arguments that goes straight to `subprocess.run`. If an example can't be expressed that way, ToolDock leaves it out instead of approximating it.

## Status

This is a local prototype (version 0.14 in `pyproject.toml`) with a pytest suite. It has no public repository. The REST call route is explicitly trusted-local: it has no caller authentication, no timeouts and no output limits. It only rejects non-loopback hosts and cross-origin browser requests. Remote access exists as a written safety checklist, not as code.
