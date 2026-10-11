---
title: "SwitchPlane"
slug: switchplane
excerpt: "A single-owner control plane that runs small typed routines across my own machines, with leases, fencing and digest-checked artifacts."
date: 2026-09-06
tags: [Python, SQLite, Distributed Systems]
featured: false
---

## What it is

SwitchPlane is a personal control plane for running work across more than one machine I own. I save a Routine, which is a linear chain of one to five typed actions such as "extract document text, then analyze the text". SwitchPlane decides which enrolled machine runs each step, moves the intermediate file between them, and records what actually happened.

The spec frames it as a validation MVP around one question: can a laptop and a workstation feel like one dependable environment if I no longer choose machines or copy files by hand? It is deliberately not a workflow builder. It has no branching, loops, shell nodes or graph editor.

## How it works

- **Control plane.** One Python 3.12 process with no runtime dependencies: `http.server`, `sqlite3` and `hashlib` from the standard library. All state lives in one JSON document inside SQLite, updated in `BEGIN IMMEDIATE` transactions with WAL and `synchronous=FULL`. A small vanilla-JS owner UI covers routines, placement preview, runs, artifacts and machines.
- **Providers.** Each machine runs a provider agent (a minimal ToolDock in the same repository) that connects outbound over authenticated HTTP. It sends heartbeats with its inventory, capacity, GPU flag and running attempts, polls for leases, reports events, downloads only the input for its own attempt and uploads the output with a SHA-256 header. It refuses redirects.
- **Capabilities and implementations.** A Capability is a small versioned contract: accepted input media types, an output type, a retry class and an optional conformance fixture. Providers advertise implementations that are unmapped, declared or verified. Only verified implementations are substituted automatically. An unmapped one runs only when a routine selects it explicitly.
- **Placement.** Hard constraints (local only, require provider) filter the candidates. Soft preferences (prefer provider, prefer GPU) rank them, then active load, then provider and implementation ID as a deterministic tie-break. The preview shows the chosen machine and the reason in plain words.

## Design decisions

**Unknown is a real state.** A lease lasts 30 seconds. When it expires, the attempt becomes `unknown`, not `failed`, because a dropped connection doesn't prove the process stopped. Only retry-safe requests are retried, at most three attempts. Each attempt carries a fencing generation, so a stale provider can't finalize a request that has moved on. I wrote about this part in more detail [in a separate post](/blog/leases-and-fencing-for-one-person).

**Artifacts are immutable and digest-checked.** The control plane recomputes every upload's SHA-256 and compares it with the provider's claim. Blobs go through temp file, fsync and rename. The artifact metadata commits in the same transaction that completes the attempt. Digests are checked again on every read. On startup, any blob that no metadata refers to is deleted.

**Runs are frozen.** A Run snapshots its routine and the planned implementation revision. The first dispatch must match that revision exactly; if the installed tool changed in between, I start a new run. Every output artifact records the implementation revision that produced it.

## Status

Prototype. According to the validation ledger, 21 control-plane tests and 5 provider tests passed. The integration test starts two real provider processes over HTTP and runs both routine families, including an actual FFmpeg conversion. The demo runs both providers on one host. Testing on a real MacBook plus Linux workstation over a private network, real Whisper or Ollama inference, and beta usage are all still open.

Known limits: artifacts top out at 64 MiB and are buffered in memory, there is no built-in TLS, there is a single control-plane process, and there is no exactly-once guarantee.
