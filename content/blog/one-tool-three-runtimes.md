---
title: "One tool, three runtimes: openapi-typegen in Zig, Node and Deno"
slug: one-tool-three-runtimes
excerpt: "I wrote the same OpenAPI type generator in Zig, then TypeScript, then Deno. The core barely changed; everything around it did."
date: 2026-07-08
tags: [Zig, TypeScript, Deno, Node.js, OpenAPI]
featured: false
links:
  - label: GitHub
    url: https://github.com/kshyr/openapi-typegen
---

openapi-typegen reads the schemas out of an OpenAPI spec and writes them back out as JSDoc typedefs or TypeScript types. I wrote it in Zig first, ported it to TypeScript on Node, and then started moving it to Deno under a new name, `kopenapi`. Across all three, the core stayed the same: a recursive function over JSON and some string concatenation. What changed each time was everything around it: how missing data fails, how a new output format plugs in, where the input comes from, and how the program gets onto another machine. Zig was the hardest of the three to write and the easiest to ship.

## The core is the same everywhere

Every version does the same thing. Parse the spec, take `components.schemas`, and for each schema emit a header plus one line per property. A property's type comes from a small recursive resolver. An `enum` becomes a union of string literals, an `array` recurses into `items` with a `[]` suffix, `integer` becomes `number`, and a `$ref` becomes the last segment of its path. A property missing from `required` gets marked optional. That logic fits on one screen in any language, and it barely changed between ports.

## Zig: tagged unions and `inline else`

The Zig version supports two output formats, so it needs some way to pick one at runtime. I used a tagged union:

```zig
pub const Target = union(enum) {
    jsdoc: Jsdoc,
    typescript: Typescript,

    pub fn buildTypedef(
        self: Target,
        allocator: Allocator,
        schema_key: []const u8,
        schema_object: std.json.Value,
    ) ![]u8 {
        return switch (self) {
            inline else => |target| {
                return try target.buildTypedef(allocator, schema_key, schema_object);
            },
        };
    }
};
```

`inline else` makes the compiler stamp out one prong per variant. Inside each prong, `target` has the concrete type (`Jsdoc` or `Typescript`), so `target.buildTypedef` is a direct call. There is no interface declaration and no vtable. The contract is checked structurally at compile time: add a variant whose struct has no `buildTypedef`, and the build fails at that prong. Exhaustive switches do the rest. `main.zig` switches on the target to print "JSDoc typedefs" or "TypeScript types", so a new variant breaks that switch too until it gets a label. The union arrived with the TypeScript target in v0.3.0, when the JSDoc builder moved out of `main.zig` into its own struct. A third format would take a variant, a struct and a flag in `Args.zig`.

## Zig: where the time actually went

The dispatch was the pleasant part. The time went into building strings. Without a string type, each typedef is a list of slices joined at the end, and every formatted piece is its own allocation:

```zig
if (value.object.get("enum")) |enum_| {
    const enum_values = enum_.array.items;
    var output = std.ArrayList([]const u8).init(allocator);
    defer output.deinit();

    for (enum_values) |enum_value| {
        try output.append(
            try std.fmt.allocPrint(allocator, "\"{s}\"", .{enum_value.string}),
        );
    }

    return try std.mem.join(allocator, " | ", output.items);
}
```

All of it comes from `std.heap.page_allocator`, and almost none of it is freed. For a process that writes one file and exits, that's fine in practice. It's still the wrong allocator, though. `page_allocator` hands out at least a whole page per allocation, so every quoted enum value costs a page. An `ArenaAllocator` on top of it would have been the honest choice: one arena, one `deinit`, and a lifetime that matches what the code already assumes.

The other half is `std.json.Value`. Each access is an optional unwrap and a union field access: `schema_object.object.get("properties").?.object`. The code assumes every schema has `properties` and every enum value is a string. In Debug and ReleaseSafe builds, a spec that breaks those assumptions panics. It doesn't silently produce garbage, but it doesn't produce a helpful error either. Zig made every assumption visible as a `.?`, and I chose to assert most of them instead of handling them.

## Node: the same resolver with less ceremony

The TypeScript port of the resolver is shorter mostly because strings are free. A lookup table replaces the `if` chain for primitive types, `$ref.split("/").pop()` replaces the manual split iterator, and missing data falls back with `?.` and `|| {}` instead of a panic. A spec without schemas now gets a real error message: "No schemas found in OpenAPI spec".

Targets became an interface with classes behind it:

```ts
export type Target = {
  buildTypedef(schemaKey: string, schemaObject: unknown): Promise<string>;
}

// generator.ts
private getTarget(): Target {
  switch (this.args.target) {
    case "jsdoc":
      return new JsdocTarget();
    case "typescript":
      return new TypescriptTarget();
    default:
      throw new Error(`Unknown target: ${this.args.target}`);
  }
}
```

Structurally, this is the Zig design moved to runtime. Both versions still need a switch that maps a name to an implementation. Zig does the dispatch at compile time, TypeScript does it through a method call per schema, and for a type generator the difference doesn't matter. The difference that did matter is how much each type checker lets through. The JSDoc target writes the schema's description into the header with a template literal, `${schemaObject.description}`. `description` is optional, and TypeScript happily interpolates `undefined`, so a schema without a description comes out as `@typedef {Object} Pet - undefined`. Zig won't format an optional with `{s}` at all until you unwrap it.

The port was also where features got cheap. The input can now be a URL. The CLI checks it with `new URL()`, downloads it with the built-in `fetch`, and caches it for an hour in the platform's cache directory from `env-paths`. The cache file name is the URL in base64 with the non-alphanumeric characters replaced. The response goes through `JSON.parse` before it's written, so an HTML error page doesn't get cached as a spec. In Zig, that feature would have meant an HTTP client, an allocator for the body, and my own per-OS cache-directory logic. In Node it's a few dozen lines. Argument parsing moved to `commander`, with `-t`, `-i` and `-o` flags and TypeScript as the default target.

## Distribution

This is where the order flips.

The Zig build uses `standardTargetOptions`, so any target is one `-Dtarget=` away. The v0.3.0 release is two files on GitHub, one for Linux x86_64 and one for macOS arm64. The macOS one is about 300 KB and has no runtime to install.

The Node version needs Node, and npm is the natural channel. I never got as far as a `bin` entry in `package.json`, so it isn't set up as an installable command yet.

Deno was supposed to give me both: keep writing TypeScript and still ship a binary. `deno compile` bundles the script with the runtime, and goreleaser has a Deno builder that cross-compiles from one machine:

```yaml
builds:
  - builder: deno
    targets:
      - x86_64-pc-windows-msvc
      - x86_64-apple-darwin
      - aarch64-apple-darwin
      - x86_64-unknown-linux-gnu
      - aarch64-unknown-linux-gnu

publishers:
  - name: jsr
    cmd: deno publish --dry-run
```

That works, and the archives come out with OS and architecture in the name, ready for a release page. The cost is size. The snapshot macOS arm64 binary is 64 MB, because it carries the whole Deno runtime. The Zig binary for the same platform is about 300 KB. JSR publishing is wired in as `@kshyr/kopenapi`, still as a dry run.

To be clear about where kopenapi is: so far it's the release pipeline and a CLI skeleton, a `Cli` class plus a `Command` type with room for subcommands, because the plan is a set of OpenAPI utilities rather than one generator. The `typegen` command is still a stub. The generator itself lives in the Zig and Node versions.
