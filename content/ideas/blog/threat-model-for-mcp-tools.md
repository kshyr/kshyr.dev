---
title: "A threat model for MCP tools that run commands"
slug: threat-model-for-mcp-tools
excerpt: "Writing down a threat model for ToolDock, which exposes local commands over MCP, and closing the gaps it finds with tested changes."
date: 2026-10-07
tags: [MCP, Security, Python, Threat Modeling]
featured: false
---

## The idea

ToolDock already makes several safety decisions: argv instead of a shell, every Action disabled until I enable it, enrichment sources that can't touch execution columns, and an HTTP server bound to loopback. What it doesn't have is a written threat model, and its own status section admits gaps: the REST call route has no caller authentication, no timeouts and no output limits, and remote access exists only as a checklist.

This post would write the threat model properly (assets, actors, trust boundaries, attack paths) and then fix what it finds, so it ends with tested code changes rather than only a diagram. Questions I expect to work through:

- Can a caller pass an argument value that a program reads as an option, such as one starting with `-`?
- Can tool descriptions taken from outside sources change what a client decides to call?
- Can a web page open in my browser reach the loopback server through DNS rebinding or a cross-origin request?
- What happens with a command that never exits or prints gigabytes?
- Can the executable at the stored path change between discovery and execution?

## Why it's worth writing

Anyone building a server that lets an automated client trigger actions on a machine needs people who can reason about trust boundaries, and security-minded writing about a real tool I built reads very differently from a general explainer. It also shows I can review my own work critically and change it, which is what a security review at work actually asks of an engineer.

## Outline

- What ToolDock exposes, and what it already does to limit that
- Assets and actors: my files and credentials, the MCP client, local web pages, the upstream data sources
- Trust boundaries: client to server, server to executable, data sources to the database, browser to loopback
- Argument values as an attack surface: option injection, paths and where `--` helps
- The loopback HTTP server: Host and Origin checks, DNS rebinding, and adding a token
- Resource limits: timeouts, output caps, killing the whole process group
- What I changed, with the tests that prove it
- What's accepted or out of scope, and why

## What I need first

- An audit of argument rendering for option injection, with failing tests written before any fix.
- Timeouts, output caps and process-group cleanup implemented and tested.
- A test of the loopback server against a DNS rebinding setup and cross-origin requests from a local page, recording what's blocked today and after the change.
- A decision on caller authentication for the HTTP transport, at least a token.
- A decision on whether ToolDock gets a public repository, since the post is stronger if readers can check the code.

## What to measure / show

- The threat list with a status for each item: mitigated, accepted or open.
- The test name that covers each mitigation.
- Before and after behavior for a runaway command such as `yes`: output cut off at the cap and the process gone within the timeout.
- Links to the commits behind each change.
