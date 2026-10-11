---
title: "openapi-typegen 1.0"
slug: openapi-typegen-v1
excerpt: "Taking openapi-typegen to a 1.0 on npm: OpenAPI 3.1, composition keywords, tests against real public specs and a browser playground."
date: 2026-10-07
tags: [OpenAPI, TypeScript, npm, Testing]
featured: false
---

## The idea

Take openapi-typegen from a tool that handles the simple case to a 1.0 I'd be comfortable seeing in someone else's `package.json`. The Zig version handles object schemas with `properties`, string enums, arrays and refs, and panics on `allOf`/`oneOf`, schemas without `properties` and numeric enums. The TypeScript port is the better base for something people install with npm and run in a browser, so 1.0 builds on that.

For me, 1.0 means: OpenAPI 3.0 and 3.1 input, composition keywords, nullability in both forms (3.0's `nullable` and 3.1's `type: ["string", "null"]`), an error that points at the offending schema instead of a crash, a package on npm, and a browser playground where you paste a spec and see the output.

## Why it's worth building

Any team with a typed frontend over a REST API runs into this problem, and teams that maintain internal tooling look for people who have owned a package others depend on. Publishing a versioned release with semver, a changelog, a test corpus built from real specs and documentation is a different skill from writing the first version, and it's the one that counts in that conversation. The project already has three implementations behind it, so finishing it properly is also an honest answer to "do you ship".

## Scope

MVP:

- OpenAPI 3.0 and 3.1 input, JSON or YAML, from a file or a URL
- `allOf`, `oneOf`, `anyOf`, `const`, enums of any primitive, `additionalProperties`, both nullability forms, and `readOnly`/`writeOnly` noted in doc comments
- TypeScript and JSDoc output with deterministic ordering
- Errors that name the JSON pointer of any schema that can't be converted, and a flag to skip it and continue
- Snapshot tests against a pinned corpus of public specs, such as GitHub's REST API description, Stripe's spec and a sample from the APIs.guru directory, plus `tsc --noEmit` on every generated file
- An ESM npm package with a CLI and a programmatic API
- A static browser playground that runs the same core

Non-goals:

- Generating an HTTP client
- Swagger 2.0
- Runtime validators
- Reviving the Zig version for this release

## Milestones

1. Build the corpus: pin spec versions, run the current tool over it and record what fails and why. One evening. That list becomes the 1.0 issue list.
2. Rework the schema-to-type pass for composition and nullability, with unit tests per keyword. A weekend.
3. 3.1 support and error reporting with JSON pointers. A weekend.
4. Packaging, CLI flags, docs, a changelog and release automation in GitHub Actions with npm provenance. One evening.
5. The playground: bundle the core for the browser, an editor and output pane, and shareable links. A weekend.

## What to measure / show

- Corpus coverage: how many specs and schemas produce types that compile, for the current version and for 1.0, both from the same script.
- Generation time for the largest spec in the corpus.
- The npm package, its version and the size of the core bundle.
- The playground URL.
- Notes on where my output differs from openapi-typescript and why, with no claim of being better unless the corpus shows it.
