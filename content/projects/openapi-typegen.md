---
title: "openapi-typegen"
slug: openapi-typegen
excerpt: "A small Zig CLI that turns the schemas in an OpenAPI spec into JSDoc typedefs or TypeScript types."
date: 2024-06-10
tags: [Zig, OpenAPI, TypeScript, JSDoc, CLI]
featured: true
links:
  - label: GitHub
    url: https://github.com/kshyr/openapi-typegen
---

openapi-typegen is a command-line tool written in Zig. It reads an OpenAPI 3.0 JSON spec and writes one type definition for every schema under `components.schemas`, either as a JSDoc `@typedef` or as a TypeScript `type`:

```sh
openapi-typegen -target=<jsdoc|ts> path/to/openapi.json path/to/output.<js|ts>
```

## The problem

If you consume an API that publishes an OpenAPI spec, the shapes of its request and response objects are already written down. Retyping them by hand on the frontend is tedious, and the copies drift from the spec. The tool started as `openapi-to-jsdoc`, aimed at plain JavaScript code that still wants editor type checking through JSDoc. TypeScript output came in v0.3.0, along with the rename.

## How it works

The spec is parsed with `std.json` into a dynamic `std.json.Value`. The schemas object is an array hash map, so the output keeps the spec's order. For each schema the selected target builds a string, and the strings are joined and written to the output file. The tool then reports how many types it wrote.

The type mapping is deliberately small:

- `enum` becomes a union of string literals.
- `type: array` recurses into `items` and appends `[]`.
- `integer` becomes `number`. In the TypeScript target, `object` becomes `Object`.
- `$ref` resolves to the last segment of the reference path, so `#/components/schemas/Pet` becomes `Pet`.
- Properties missing from the schema's `required` list are marked optional: `[name]` in JSDoc, `name?` in TypeScript.

The TypeScript target also strips characters that aren't valid in an identifier from type and property names.

## Design decisions

**Targets as a tagged union.** `Target` is a `union(enum)` with one variant per output format, and dispatch is a `switch` with an `inline else` prong. That prong forwards to the payload's own `buildTypedef`. The union came in with the TypeScript target, when the JSDoc code moved out of `main.zig` into its own struct. Another format would take one more variant, a struct with that method, and a flag. Any exhaustive switch over the union fails to compile until it handles the new variant.

**Strings as lists of slices.** Each typedef is assembled as a list of string slices joined at the end, with `std.fmt.allocPrint` for the formatted pieces. Everything comes from one allocator and is never freed individually. The process exits after writing a single file, so that's acceptable here.

**Hand-rolled arguments.** Argument parsing is a short loop in `Args.zig` with no dependencies. It matches `-target=jsdoc`, `-target=ts` or `-target=typescript`, then takes the input and output paths positionally.

**Standalone binaries for releases.** Releases are plain executables on GitHub. v0.3.0 ships Linux x86_64 and macOS arm64 builds, with nothing to install alongside them.

## Status

v0.3.0 is the last release, built against a Zig 0.13 development build, and I haven't kept it up with newer Zig versions. It covers the simple case only: object schemas with `properties`, string enums, arrays and refs. Anything else, such as a schema without `properties`, `allOf`/`oneOf`, or a numeric enum, runs into an optional unwrap or a union field access that assumes the simple shape. In safe builds that's a panic, not a helpful error message.

Later I rewrote the tool in TypeScript for Node, adding URL inputs with a local cache. After that I started a Deno version, `kopenapi`, meant to become a broader set of OpenAPI utilities. I wrote about how the three versions compare [in a separate post](/blog/one-tool-three-runtimes).
