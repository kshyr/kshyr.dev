---
title: "envpoint"
slug: envpoint
excerpt: "A Go CLI and terminal UI that deploys Docker Compose environments to my machines over SSH, with pluggable remote-access providers."
date: 2026-04-05
tags: [Go, Docker Compose, SSH, FRP, CLI]
featured: true
---

## What it is

envpoint is my "homelab without the headache" tool. Each self-hosted experiment is a directory under `environments/` that holds a `compose.yml`, an optional `.env`, an `env.yml` with metadata (name, assigned machine, status, provider config) and a `notes.md`. Machines are SSH hosts listed in `machines.yml`.

`envpoint env up mysite` creates `$HOME/envpoint/mysite` on the assigned machine, uploads the compose file (and `.env`, if present) and runs `docker compose up -d`. `down`, logs, archive and "move to another machine" work the same way. Archiving only flips the status; nothing is deleted.

## How it works

The CLI is Cobra: `machine add/list`, `env new/list/up/down/archive` and `provider setup`. When required flags are missing, the commands fall back to interactive prompts. Running `envpoint` with no arguments opens a menu-driven TUI built by shelling out to charmbracelet's `gum` (`choose`, `input`, `confirm`, `pager`). It has four views: Environments, Machines (with a ping check), Remote (tunnel status, connect/disconnect) and New. New is a wizard with nginx, postgres and empty starter templates, plus optional FRP setup.

All remote work goes through one small interface:

```go
type Executor interface {
	Run(cmd string) (string, error)
	WriteFile(remotePath string, content []byte) error
}
```

A host named `localhost` gets a `LocalExecutor` (`sh -c`). Everything else gets an `SSHExecutor` built on `golang.org/x/crypto/ssh` with key auth. `WriteFile` over SSH streams the content into `cat > path` on the session's stdin, so it doesn't need SFTP.

Remote access is a second interface, `Provider`, with four methods: `Setup`, `Up`, `Down` and `Status`. FRP ships first. Its provider takes two executors, one for the public machine running `frps` and one for the machine running the environment and `frpc`. `Up` writes both configs under `$HOME/envpoint/.frp` and restarts both processes. Provider settings live in `env.yml` as a loose map, so each provider owns its own keys. The TUI uses `server_host` and `remote_port` from that map to offer "Open in browser".

## Design decisions

**One seam for side effects.** Machines, environments and the FRP provider only talk to an `Executor`. A `MockExecutor` records every command and written file, so the environment lifecycle, `Move` and the whole FRP up/down sequence are tested without SSH, Docker or frp installed.

**Plain files as the source of truth.** An environment is a directory I can read, edit and put in git. envpoint generates starting points and moves files around; it doesn't hide the compose file behind its own format.

**Providers are separate from environments.** Bringing a stack up and making it reachable from outside are different problems, so they live behind different interfaces. Adding another tunnel or overlay should mean implementing four methods, not changing the deploy path.

## Status

Early prototype, with no public repository. The shortcuts are deliberate, but they're still shortcuts:

- SSH host keys aren't verified (`InsecureIgnoreHostKey`, marked as a v1 simplification).
- Remote commands are built as strings without quoting.
- An environment's status is whatever envpoint last did, not a check of what is running.
- FRP "connected" means an `frpc` process exists on the client, not that the tunnel is up.
- frp binaries have to be installed on both machines beforehand.

There's a written design for replacing the `gum` subprocess menus with a proper Bubble Tea application, but it isn't implemented yet.
