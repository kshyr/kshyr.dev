---
title: "Contract-testing a frontend against an OpenAPI spec"
slug: contract-testing-a-frontend-against-openapi
excerpt: "Using generated types, spec-validated mocks and recorded responses to catch drift between a frontend, its mocks and an OpenAPI spec."
date: 2026-10-07
tags: [OpenAPI, TypeScript, Testing, MSW]
featured: false
---

## The idea

Generated types tell you at compile time what an API is supposed to return. They don't tell you when the spec, the real server and the frontend's test mocks quietly disagree. This post would build a small example: a React app against a public API with a maintained spec (GitHub's REST API is a good candidate), types generated with openapi-typegen, MSW mocks whose responses are validated against the spec's schemas, and a scheduled CI job that validates recorded real responses against the spec. Drift then shows up as a failed test instead of a bug in production.

## Why it's worth writing

Frontend teams spend a lot of time on bugs that come from mocks that no longer match the server. A testing strategy that catches that with little ceremony is something hiring managers ask about directly, and a worked example with a real API is more convincing than a diagram. It also gives openapi-typegen a real use case and shows where generated types stop being enough.

## Outline

- Three things that drift: the spec, the server and the mocks
- Types at compile time, and what they can't catch
- Validating mock responses against the spec on every test run
- Recording real responses and validating them in CI on a schedule
- Catching breaking changes when the spec version changes, by diffing specs
- Where this approach stops, and what consumer-driven contract testing adds
- Cost in CI time and upkeep

## What I need first

- openapi-typegen 1.0, or at least its 3.1 and composition support, since real specs rely on both.
- The example app, small but real, against GitHub's REST API.
- A JSON Schema validator set up for 3.1 (Ajv with draft 2020-12 is the likely choice) and a test helper that checks every MSW response.
- A real drift example: either a past case where a public spec and live responses differed, or one I introduce in a fork. The post will say which it is.

## What to measure / show

- The example repo, with CI.
- A linked CI run that failed because of drift.
- Time the validation adds to the test suite.
- How many mismatches validation found in recorded responses from the real API, whatever the number is, including zero.
