---
title: "What WebGPU compute shaders taught me about the GPU"
slug: what-webgpu-compute-shaders-taught-me
excerpt: "Notes I plan to write while building a WebGPU N-body sim: workgroup sizes, shared memory, data layout and readback, each backed by a benchmark."
date: 2026-10-07
tags: [WebGPU, WGSL, Graphics, Performance]
featured: false
---

## The idea

A companion post to gravity-well. It would cover the parts of GPU compute that I expect to understand only after measuring them: choosing workgroup sizes, tiling with workgroup memory, data layout and WGSL alignment rules, the cost of reading results back to the CPU, and measuring time on the GPU with timestamp queries. Every section ends with a number from my own benchmark mode, not a rule of thumb copied from somewhere else.

I'd also compare it with my OpenGL work in regnie: what WebGPU's explicit pipelines and bind groups make easier, and what they make more verbose.

## Why it's worth writing

Teams building graphics or heavy visualization in the browser need people who can explain performance with data. A post where every claim has a benchmark behind it, and the benchmark runs in the reader's browser, is clear technical writing on a hard topic, which is a signal on its own. It also gives the gravity-well demo context for readers who aren't graphics people.

## Outline

- The naive N-body kernel and its first numbers
- Workgroup sizes: what I tried and what changed
- Tiling with workgroup memory, and why it helps here
- Data layout and alignment: a `vec3<f32>` in a storage buffer takes 16 bytes, and other surprises
- Readback: mapping buffers and why I avoid it every frame
- Measuring on the GPU: timestamp queries, their availability and their caveats
- How results differed between machines and browsers
- Coming from OpenGL: what's easier and what's harder

## What I need first

- gravity-well through its second milestone, including benchmark mode.
- Benchmark results from at least two GPUs and two WebGPU-capable browsers.
- Both the naive and tiled kernels kept in the repo, switchable at runtime.
- A layout experiment: the same kernel with packed `vec4` data against separate arrays.
- A readback experiment that copies positions to the CPU every frame, to measure what it costs.

## What to measure / show

- GPU time per step against body count for each kernel variant.
- The effect of workgroup size on that time.
- Readback cost per frame.
- An embedded link to the benchmark mode so readers can compare with their own hardware.
