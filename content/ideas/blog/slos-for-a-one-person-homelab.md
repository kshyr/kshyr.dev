---
title: "SLOs for a one-person homelab"
slug: slos-for-a-one-person-homelab
excerpt: "A plan for a few SLOs on the one VM that runs my services: checks from outside, burn-rate alerts, a status page and months of real data."
date: 2026-10-07
tags: [SLO, Observability, Self-hosting, Docker]
featured: false
---

## The idea

My portfolio, Ghost and a few other services run on one Oracle Cloud arm64 VM, deployed with Komodo from images built in GitHub Actions, with Ghost reachable only inside my tailnet. Right now I find out something is broken when I happen to open it. This post would define a small number of SLOs for that setup, check them from outside the VM, alert on error-budget burn rather than on every failed probe, publish a status page, and then report what a few months of data showed.

The interesting questions are specific to running things alone. What deserves an SLO at all? The public site does; an admin UI only I use may not. What does "on call" mean when there's one person, no redundancy and nobody paying for uptime?

## Why it's worth writing

On small teams, product engineers often own uptime along with features. Applying SLOs, error budgets and burn-rate alerts in proportion to a single VM, instead of copying a large company's setup, shows I understand what the tools are for. It sits next to SwitchPlane and envpoint as evidence that I care about running software, not only writing it.

## Outline

- What runs where, and what visitors and I actually depend on
- Choosing SLIs: availability and latency of the public site from outside, Ghost reachability inside the tailnet, deploy success
- Targets that fit one VM with no failover
- Synthetic checks: where they run, and why not on the same VM
- Burn-rate alerts and where they go
- The status page
- What the months of data showed: incidents, false alarms, budget used
- What I stopped measuring

## What I need first

- A prober outside the VM, for example Gatus on a second machine, plus one check from my home network over the tailnet.
- Alert routing to my phone and a test that proves it fires.
- At least two to three months of data before writing, including at least one real incident or a deliberate one (stop a container and see what happens and how long it takes me to hear about it).
- A decision on whether to add OpenTelemetry traces to the site or stay with black-box checks, and the reasoning for the post.

## What to measure / show

- Each SLO's target and actual attainment per month.
- The number of alerts, and how many pointed at a real problem.
- Time from failure to notification in the planned outage test.
- The status page URL.
- The check and alert configuration files.
