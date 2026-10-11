---
title: "pact"
slug: pact
excerpt: "A small Go daemon that runs shell scripts on cron schedules from a TOML registry. Airflow's idea with nearly everything taken out."
date: 2024-10-20
tags: [Go, Cobra, cron, TOML]
featured: false
links:
  - label: GitHub
    url: https://github.com/kshyr/pact
---

pact is a script scheduler. The whiteboard file in the repo pitches it as "like Apache Airflow, but simpler", and the user story under that pitch is short: I have shell scripts, I want them to run on intervals in the background, and I want the schedule to live next to the scripts instead of in a system unit file. systemd timers are crossed out on the same whiteboard.

## How it works

There are three pieces: a registry, a scheduler, and a daemon that hosts the scheduler.

- **Config.** `$XDG_CONFIG_HOME/pact/config.toml` holds one setting, `scripts_dir`. If the file is missing, pact creates it and points the directory at `$XDG_DATA_HOME/pact/scripts`.
- **Registry.** `scripts.toml` in that directory lists `[[scripts]]` entries: `name`, `file`, `args`, `schedule` (cron), `at` (a one-shot ISO 8601 time), `description` and `active`. A script file is never edited; the same file can be registered several times with different arguments. The example registry does exactly that, running one `beep.sh` at 440, 392 and 349 Hz on different intervals.
- **Scheduler.** The `timekeeper` package hands every active script with a `schedule` to `robfig/cron`, and scripts with only an `at` time to `time.AfterFunc`. The `invoker` runs the script through `/bin/sh` with its arguments.
- **Daemon.** `pact demon start` re-executes the binary with `DEMON=1` in a new session, sends its output to a log file under the XDG cache dir, and records a PID file. `demon status` checks the PID with signal 0, and `demon stop` sends `SIGTERM`. On Linux the daemon renames its thread to `demon` with `prctl(PR_SET_NAME)`, behind a build tag. Other platforms get a no-op.

The CLI is Cobra (`demon start|stop|status`, `invoke <name>`, `list`, `config`, `scripts-dir`), and logging is logrus writing to both the log file and stdout.

## Design decisions

**Metadata in a TOML file, not in script headers.** The first plan was to embed metadata in each script, or derive it from the filename. Both ideas are struck through on the whiteboard. A separate registry means scripts stay untouched and portable, at the cost of keeping two files in sync.

**A self-managed daemon instead of a supervisor.** pact daemonizes itself rather than generating systemd or launchd units. That keeps setup to one command and works the same on Linux and macOS, but it means re-implementing PID tracking and shutdown by hand. I [wrote up the details and the trade-offs separately](/blog/daemonizing-go-without-a-supervisor).

**Seconds in cron expressions.** The cron instance is built with `cron.WithSeconds()`, so schedules take six fields (`*/2 * * * * *`), and descriptors like `@every 5s` also work. That made it easy to test scheduling without waiting minutes per run.

## Status

pact is early: four commits, and the daemon runs active scripts on schedule. The rough edges are all visible in the code:

- `after` is documented in the registry comments but never parsed.
- The comments say `at` wins over `schedule`. The code checks `schedule` first.
- Scripts always run through `/bin/sh`. Respecting the shebang is an open item on the whiteboard.
- Changes to `scripts.toml` need a daemon restart. Live reload is the main open design question on the whiteboard.
- The daemon's main loop polls instead of blocking, so it spins while idle.
- Nothing starts the daemon at login or boot yet.
