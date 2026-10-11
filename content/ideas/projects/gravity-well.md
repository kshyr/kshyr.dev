---
title: "gravity-well"
slug: gravity-well
excerpt: "A WebGPU N-body playground that will run gravity on compute shaders in the browser, with GPU timings and setups you can share as links."
date: 2026-10-07
tags: [WebGPU, WGSL, TypeScript, Graphics]
featured: false
---

## The idea

gravity-well is a browser N-body playground running on WebGPU compute shaders. Every frame a compute pass updates velocities and positions for all bodies, and a render pass draws them as instanced points over a deformed grid like the one in my Bevy gravity sim. Controls change the body count, timestep, softening and starting scenario (a disk galaxy, two colliding clusters, a random cloud), and an overlay shows frame time measured on the GPU.

The first version uses the direct O(n²) method with workgroup memory tiling. Barnes-Hut on the GPU is a stretch goal, not a promise.

## Why it's worth building

Teams building graphics-heavy products, such as maps, editors, data visualization or browser games, want people who understand the GPU pipeline and can measure it, not only call a library. A live demo with GPU timings on screen is direct evidence of that. It continues work I've already started, regnum's TypeScript/WebGPU experiment and the Bevy gravity sim, so it's a next step rather than a detour. It's also the kind of page people send to each other, which brings visitors to the rest of the site.

## Scope

MVP:

- WebGPU setup with a clear message and a short recording where WebGPU isn't available
- WGSL compute shader with ping-pong storage buffers and tiled workgroup memory
- Instanced point rendering and a spacetime grid deformed by the heaviest bodies
- Preset scenarios, with parameters encoded in the URL so a setup can be shared
- GPU timing through timestamp queries where the adapter supports them, CPU frame time otherwise
- A CPU reference implementation in TypeScript, used for correctness tests with small body counts
- Controls that work by keyboard, a pause button, and a paused start when `prefers-reduced-motion` is set

Non-goals:

- Physically accurate astrophysics. It's a playground.
- A full WebGL fallback renderer.
- A general-purpose engine.

## Milestones

1. Compute and render skeleton with a thousand bodies and a fixed timestep. One evening.
2. The tiled kernel, timestamp queries and a benchmark mode that sweeps body counts and workgroup sizes. A weekend.
3. Correctness: compare GPU and CPU positions after a fixed number of steps for small systems within a tolerance, and track total energy drift. One evening.
4. Grid deformation, presets, shareable URLs and accessible controls. A weekend.
5. Deploy as a static page on my own domain and write up what I learned (see the WebGPU post concept).

## What to measure / show

- A live URL that anyone with a WebGPU-capable browser can open.
- GPU time per step against body count for the naive and tiled kernels, on at least two machines, collected with the built-in benchmark mode so readers can run it themselves.
- The largest body count that holds 60 frames per second on each machine I test.
- Energy drift over time for each integrator I try.
- The source, with tests that compare the GPU result to the CPU reference.
