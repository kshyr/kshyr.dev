---
title: "Compiling tldr pages into MCP tools"
slug: tldr-pages-to-mcp-tools
excerpt: "How ToolDock turns tldr examples into argv templates, drops anything that needs a shell, and picks one template per call."
date: 2026-09-24
tags: [Python, MCP, CLI, tldr-pages]
featured: false
---

A tldr page is a list of curated recipes for humans: `ollama run {{model}}`, `docker compose up --detach`, `tar {{[-c|--create]}} {{[-f|--file]}} {{path/to/target.tar}} ...`. An agent shouldn't get a shell. It should get a short list of known command shapes, each with a JSON schema, that become an argv without a shell ever parsing them. tldr already did the hard part of choosing which shapes matter. In ToolDock I wrote a deliberately conservative compiler from those recipes to templates, and a selector that picks exactly one template per call.

## Protect the placeholders before parsing anything

Placeholder text is prose. It contains spaces (`{{path/to/file1 path/to/file2 ...}}`), quotes and punctuation. If shell-operator detection or `shlex` saw that text, a placeholder could split into several tokens or get the whole example rejected for a semicolon in its description. So the first step swaps every `{{...}}` for an opaque marker, and only then looks at the command:

```python
_PLACEHOLDER = re.compile(r"\{\{(.*?)\}\}")

def _protect_placeholders(command: str) -> tuple[str, dict[str, str]]:
    mapping: dict[str, str] = {}
    index = 0
    def replace(match: re.Match[str]) -> str:
        nonlocal index
        marker = f"__TD_P{index}__"
        index += 1
        mapping[marker] = match.group(1).strip()
        return marker
    return _PLACEHOLDER.sub(replace, command), mapping


def _has_shell_operators(command: str) -> bool:
    return any(needle in command for needle in (" | ", " > ", " < ", " && ", " || ", ";", "$(", "`"))


def _compile_example(root: str, example: TldrExample) -> tuple[str, str, dict, list[str]] | None:
    protected, placeholders = _protect_placeholders(example.command)
    if _has_shell_operators(protected):
        return None
    try:
        tokens = shlex.split(protected, posix=os.name != "nt")
    except ValueError:
        return None
    if not tokens or Path(tokens[0]).name != root:
        return None
    # ...
```

Anything that needs a shell is dropped, not translated. A pipeline has no argv equivalent, and I'd rather lose `grep ... | wc -l` than build a tiny shell. An unbalanced quote that `shlex` can't split is dropped too, and so is an example whose first token isn't the page's command.

The check is a substring test, and it's imprecise in both directions. `find . -name "{{*.txt}}" -exec rm {} \;` gets rejected because of `\;`, even though `\;` is just a literal argument once you're in argv. The other way, `ls 2>/dev/null` written without spaces gets through, and the compiler produces an Action called `ls.2_dev_null` whose argv contains the literal string `2>/dev/null`. That one is wrong but harmless. No shell ever sees it, so `ls` just gets a strange filename argument. I've kept the check simple because both kinds of error fail safe.

## Identity comes from the subcommand path

After tokenizing, the compiler walks forward from the root command, collecting subcommands until it reaches a flag or a real placeholder. That path becomes the Action ID: `docker compose up --detach` compiles to `docker.compose.up`. A few tldr conventions needed explicit handling:

- `{{[co|checkout]}}` is a fixed alternative, not an input. The compiler takes the last (long) form for both the ID and the argv, so `git {{[co|checkout]}} {{branch}}` becomes `git.checkout` with one `branch` parameter.
- `{{[-h|--help]}}` also looks like an alternative, but every option starts with `-`, so it's a flag and the subcommand walk stops. An earlier build got this wrong and invented IDs like `bun.link.help`.
- A bare root invocation such as `pandoc {{input}} -o {{output}}` gets the ID `pandoc`, not an invented `pandoc.invoke`.

The argv spelling and the slugged ID are kept separately, so hyphenated subcommands are never rewritten when they run.

## Parameters and templates

The remaining tokens turn into template entries. A plain placeholder like `{{model}}` becomes a required value `{model}`. Its type is guessed from the placeholder words: "path" or "file" gives `path`, "port" or "count" gives `integer`, and everything else is a string. `--glob={{*.py}}` becomes the optional `{?glob:--glob=}`, and `--output {{path/to/file}}` uses up both tokens as `{?output:--output}`. A bare `--detach`, an all-dash alternative like `{{[-c|--create]}}`, or a literal `--think=false` becomes an optional boolean.

When several examples compile to the same ID, they merge into one Action with several templates. A value parameter is required only if every template uses it, and options are never required. The repository's test shows the result:

```python
def test_flag_variant_merges_into_one_action() -> None:
    page = TldrPage(
        command="ollama",
        description="A model runner.",
        path=Path("ollama.md"),
        examples=[
            TldrExample("Run a model", "ollama run {{model}}"),
            TldrExample("Run a prompt without thinking", "ollama run {{model}} --think=false {{prompt}}"),
            TldrExample("List models", "ollama list"),
        ],
    )
    actions = compile_pages([page], {"ollama": "/usr/bin/ollama"})
    assert [action.id for action in actions] == ["ollama.list", "ollama.run"]
    run = next(action for action in actions if action.id == "ollama.run")
    assert len(run.templates) == 2
    assert run.parameters["model"]["required"] is True
    assert run.parameters["prompt"]["required"] is False
    assert run.parameters["think"]["type"] == "boolean"
```

`ollama.run` ends up with the templates `["ollama", "run", "{model}"]` and `["ollama", "run", "{model}", "{?think:--think=}", "{prompt}"]`. The MCP input schema is built from the merged parameters with `additionalProperties: false`.

Some placeholders get lost along the way. The variadic `{{path/to/file1 path/to/file2 ...}}` becomes a single parameter that fills a single argv slot, so the tool can pass one string but never two files. Templates record positions literally and can't express repetition.

## Choosing a template at call time

An MCP call arrives as a JSON object, and the executor's job is to turn it into exactly one argv:

```python
def choose_argv(action: Action, values: dict[str, Any]) -> list[str]:
    values = validate_inputs(action, values)
    candidates: list[tuple[int, int, tuple[str, ...], list[str]]] = []
    provided = {name for name, value in values.items() if value is not None and value != ""}
    for template in action.templates:
        refs = template_parameters(template)
        if not provided.issubset(refs):
            continue
        try:
            argv = render_template(action, template, values)
        except InputError:
            continue
        # Prefer the smallest template that covers all supplied values; then use
        # argv length/text as a deterministic tie-break.
        candidates.append((len(refs), len(argv), tuple(argv), argv))
    if not candidates:
        raise InputError("No known command form can represent those inputs")
    candidates.sort(key=lambda item: (item[0], item[1], item[2]))
    return candidates[0][3]
```

`validate_inputs` rejects unknown names, enforces required ones and coerces booleans and integers. The `issubset` check is the important rule: a template is only eligible if it mentions every input the caller supplied, so a value is never dropped silently. Rendering then skips optional tokens with no value and fails on a missing required one, which removes that template from the candidates. Among the survivors, the one with the fewest parameters wins, then the shortest argv, then the lexically smallest argv. The same inputs always produce the same command.

For `ollama.run` this gives:

- `{"model": "qwen"}` renders `ollama run qwen`.
- `{"model": "qwen", "prompt": "hi"}` renders `ollama run qwen hi`.
- `{"model": "qwen", "think": true}` renders `ollama run qwen --think=true`.

The second case shows a trade-off I accepted. The example said `--think=false`, but the template only keeps the shape of the example, not its values. If the caller doesn't pass `think`, nothing is emitted and ollama falls back to its own default. If the caller combines inputs that no example ever used together, the call fails with "No known command form can represent those inputs" rather than guessing an argument order.

Once a template is chosen, `argv[0]` is replaced with the absolute executable path stored at discovery time, and the argv goes to `subprocess.run` with no shell. The MCP result carries stdout and stderr, and `is_error` is set from the return code.

## Trade-offs

The compiler throws a lot away. Pipelines are some of the most useful lines on a tldr page, and none of them survive. Type inference is keyword matching, and variadic arguments collapse into one string. In exchange, every argv ToolDock can execute is one I can preview with `shlex.join`. It comes from a known example of an Action I enabled, and none of the metadata enrichment sources are allowed to touch it. For a tool that hands command execution to an agent, I'll take a smaller catalog with that property over a bigger one without it.
