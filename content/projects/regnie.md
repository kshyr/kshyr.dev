---
title: "regnie"
slug: regnie
excerpt: "A small C++20/OpenGL renderer split into a host program and a shared library that can be swapped while the window stays open."
date: 2025-01-28
tags: [C++, OpenGL, CMake, GLFW]
featured: false
---

regnie is a small C++20 and OpenGL renderer I built to test one idea: keep the window and the GL context in a thin host program, put all the rendering code in a shared library, and replace that library while the window stays open. What it draws is a rotating, vertex-coloured triangle. The interesting part is the loop around it.

## The problem

Most renderer changes are small: a shader constant, a clear colour, a transform. Each one normally means a rebuild and restart that recreates the window and context. Hot reloading cuts that down to rebuilding one library and asking the running program to pick up the new copy.

## How it works

The CMake project has two targets.

- `exe` (`src/main.cpp`) owns GLFW, the window, the GL context and the main loop. It asks for a 3.3 core, forward-compatible context. The shaders are GLSL 410, because 4.1 is as far as macOS goes.
- `regnie` (`lib/`) is a shared library: `libregnie.so` on Linux, `libregnie.dylib` on macOS, `regnie.dll` on Windows.

The host never links against the renderer's functions directly. At startup it opens the library with `dlopen`/`dlsym` (or `LoadLibrary`/`GetProcAddress` on Windows) and looks up three `extern "C"` functions: `regnie_init`, `regnie_tick(GLFWwindow*)` and `regnie_reload`. Each frame is `regnie_tick`, swap, poll. Pressing F runs the reload path: close the library, open it again, re-resolve the three symbols and call `regnie_reload`, which runs init again in the new code.

Inside the library, a `Renderer` class keeps its GL objects (program, VAO, VBO, uniform location) in a `GLResources` struct whose destructor deletes them. A file-static `std::unique_ptr<Renderer>` holds the instance. `watch_and_compile_lib.sh` uses `inotifywait` to rebuild the library whenever `lib/regnie.cpp` is saved.

## Design decisions

**A C ABI at the boundary.** The code is C++ on both sides, but the three entry points are `extern "C"` so `dlsym` can find them by plain, unmangled names. The only type that crosses the boundary is an opaque `GLFWwindow*`.

**The host owns the context.** The window and the GL context outlive any copy of the library. The library only creates objects inside a context that already exists, which is what lets the old code go away without taking the window with it.

**RAII for GL objects.** When a library copy is unloaded, its static renderer is destroyed and `GLResources` deletes its GL names, so reloading doesn't pile up dead programs and buffers. The new copy creates its own.

**Each copy loads its own GL functions.** The library compiles its own GLAD, so every freshly loaded copy starts with null function pointers and calls `gladLoadGL` during init.

## Status

This is an experiment, about 450 lines of my own code. The last change added macOS arm64 support. There are loose ends I haven't fixed yet:

- The macOS commit dropped the `glfwSetKeyCallback` line, so the F key isn't wired up at the moment.
- On macOS, `dlclose` can't unload the library: the executable also links against it, and the dylib statically includes GLFW's Objective-C classes. Either of those keeps the old image in memory.
- The Windows branch has fallen behind. Its reload handler still calls `dlclose`, and its `regnie_tick` pointer type lacks the window argument.
- The watcher depends on `inotifywait`, which is Linux-only, and the `make lib` target now only configures the library instead of building it.

I wrote up the reload mechanics and these pitfalls in more detail [in a separate post](/blog/hot-reloading-a-cpp-renderer). regnie sits next to my other engine experiments: regnum (C and OpenGL, built as a shared library with a small test executable), regnum-web (TypeScript and WebGPU) and regnum0 (Rust on Bevy).
