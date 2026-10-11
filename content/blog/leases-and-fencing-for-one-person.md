---
title: "Leases and fencing for a party of one"
slug: leases-and-fencing-for-one-person
excerpt: "One owner removes the multi-tenant problems from a control plane but not partial failure. Leases, fencing, retry classes and digests in SwitchPlane."
date: 2026-09-15
tags: [Python, Distributed Systems, SQLite]
featured: false
---

SwitchPlane has exactly one user, me, and in its target setup two machines: a laptop and a workstation. It's tempting to treat that as a script that SSHes somewhere and waits. The trouble is that laptops sleep and Wi-Fi drops. Once a step runs on another machine over a network, "did it run?" has three possible answers, and a single owner doesn't remove any of them. The spec states it directly: provider disconnection or lease expiration does not prove that execution stopped.

So the control plane's real job is to never collapse "I don't know" into "it failed" or "it worked". Everything below exists to keep that promise.

## Leases: the control plane only knows what it was told

When a provider polls and gets work, the engine creates an Attempt with a lease of 30 seconds. The provider agent heartbeats about every 2 seconds and lists the attempts it's running. A heartbeat renews an attempt only while that attempt is `offered` or `running` and its generation is the request's current one. Heartbeats, polls and status snapshots all run `_expire` first:

```python
def _expire(self, state):
    for run, request, attempt in self._attempts(state):
        if attempt["state"] in ("offered", "running") and attempt["expires"] <= self.clock():
            attempt["state"] = "unknown"
            if request["generation"] == attempt["generation"]:
                request["state"] = "unknown"
                run["state"] = "unknown"
            self.event(state, "attempt_unknown", run=run["id"], attempt=attempt["id"])
```

An expired attempt becomes `unknown`, never `failed`. Calling it failed would invite a retry, and a retry of something that might have finished, with side effects, is how you end up with two of everything. If the provider comes back and still lists the attempt as running, the heartbeat won't revive the lease. The attempt ID goes into the response's `cancel` list instead.

## Fencing generations

Each request keeps a `generation` counter, and each new attempt increments it and stores its own copy. Every event and every output upload from a provider has to quote that number:

```python
def update_attempt(self, provider_id, attempt_id, body):
    with self.store.transaction() as state:
        run, request, attempt = self._find(state, attempt_id, provider_id)
        if body.get("generation") != attempt["generation"]:
            raise Invalid("fencing generation mismatch")
        status = body.get("state")
        # ... validate status
        authoritative = request["generation"] == attempt["generation"]
        if attempt["state"] in ("completed", "stale_completed", "failed", "cancelled", "rejected"):
            return {"accepted": False}
        # ...
        if status in ("running", "progress"):
            if not authoritative or attempt["state"] == "unknown":
                return {"accepted": False}
            attempt.update(state="running", expires=self.clock() + self.lease_seconds)
            request["state"] = "running"
        else:
            attempt["state"] = status
            if authoritative:
                request["state"] = "queued" if status == "rejected" else status
                run["state"] = "queued" if status == "rejected" else status
        # ... append the sanitized message to the attempt's log
        return {"accepted": authoritative}
```

`_find` also checks that the attempt belongs to the provider making the call, so one machine can't report on another's work. A stale attempt can still record what happened to it, but only the current generation moves the request. The provider honors this before doing any work: it sends `running`, and if the reply says `accepted: false`, it drops the lease without executing anything.

This is the classic fencing token, and it's cheap here for a specific reason. The resource being protected is canonical state and managed artifact storage, and both live in the same process and SQLite transaction that hands out generations. Nobody has to trust a worker's clock or its belief that it still holds the lease.

## Retry classes decide what "unknown" allows

Every capability and implementation declares a retry class: `safe`, `unsafe` or `unknown`. Owner-configured actions default to `unknown`. A verified capability mapping has to match the contract's retry class exactly. The scheduling loop in `poll` turns that into rules:

```python
if len(request["attempts"]) >= 3:
    break
if request["state"] == "unknown" and (request["retry"] != "safe" or len(request["attempts"]) >= 3):
    break
# ...
excluded = [a["provider"] + "/" + a["implementation"]["id"] for a in request["attempts"] if a["state"] in ("unknown", "rejected")]
candidates = self._eligible(state, step, excluded)
if not candidates and request["state"] == "unknown" and request["retry"] == "safe":
    candidates = self._eligible(state, step)
# First attempt honors the frozen preview revision. Changed inventory requires a new run.
if not request["attempts"]:
    candidates = [p for p in candidates if p["provider"] == request["plan"]["provider"]
                  and p["implementation"]["revision"] == request["plan"]["implementation"]["revision"]
                  and p["implementation"]["id"] == request["plan"]["implementation"]["id"]]
else:
    candidates = [p for p in candidates if p["implementation"]["retry"] == request["retry"]]
if not candidates or candidates[0]["provider"] != provider_id:
    break
chosen = candidates[0]
request["generation"] += 1
```

An unknown request gets a new attempt only if it's retry-safe and has used fewer than three attempts. The replacement prefers a different provider and implementation than the ones that went unknown or rejected the lease. If nothing else is eligible, it falls back to the same one. A replacement implementation must also have the same retry class as the request. The first attempt has to match the plan frozen at run start. The final `provider_id` check matters because this is a pull model: a polling provider only gets the lease if it's the scheduler's top choice, so placement stays deterministic even though workers are the ones asking.

An `unsafe` or `unknown` request that loses its lease just stays `unknown`, and that's the honest answer. The manual retry button checks the same rule. Exactly-once execution is an explicit non-goal in the spec. "Safe" means running twice is acceptable, not that it can't happen.

## Unknown can still resolve

Unknown doesn't mean lost. The provider journals a receipt in its own SQLite file and fsyncs the output bytes before reporting completion. If it was only disconnected, it replays those receipts on reconnect. What happens next depends on the generation:

- If nothing replaced the attempt (the request wasn't retry-safe, or no other provider took it), the late output is accepted as authoritative and the run completes. I checked this path directly against the engine.
- If a newer generation exists, the output is still registered, but as `stale_completed` with `authoritative: false`. Downstream steps bind to the request's canonical output, so a stale result never unblocks them.
- If the run was cancelled, the output is kept as non-authoritative too. Cancellation is a request, not proof that anything stopped.

## Digests make two outputs distinguishable

Retries mean one request can produce two outputs, so I need to be able to tell them apart later. Registration does that:

```python
actual = digest(data)
if not expected_digest or not hmac.compare_digest(actual, expected_digest):
    raise Invalid("artifact SHA-256 digest mismatch")
# ... filename and media type checks
# Temp + fsync + atomic rename. Only registered metadata makes a blob visible.
fd, temporary = tempfile.mkstemp(prefix=".transfer-", dir=self.store.blobs)
try:
    with os.fdopen(fd, "wb") as stream:
        stream.write(data)
        stream.flush()
        os.fsync(stream.fileno())
    with self.store.transaction() as state:
        # ...
        if provider_id:
            run, request, attempt = self._find(state, attempt_id, provider_id)
            if generation != attempt["generation"]:
                raise Invalid("fencing generation mismatch")
            if attempt["output"]:
                old = state["artifacts"][attempt["output"]]
                if old["digest"] != actual or old["media_type"] != media_type:
                    raise Invalid("completed output is immutable")
                return old
            # ... attempt state and output media type checks
            authoritative = generation == request["generation"] and not run["cancel_requested"]
        os.replace(temporary, self.store.blobs / actual)
        # ... fsync the directory, record the artifact with parents and implementation revision
```

The provider sends the SHA-256 it computed, and the control plane recomputes it before anything becomes visible. Blobs are stored under their digest. The artifact record and the attempt's completion are written in the same transaction. Uploading the same output twice returns the existing artifact, which makes receipt replay idempotent. Uploading different bytes for an already completed attempt fails. Reads check the digest again, and a provider can only download the input of its own attempt. On startup, the store deletes leftover `.transfer-` files and any blob without committed metadata, so a crash between rename and commit leaves nothing visible behind.

Each artifact records its parent, its run, request and attempt, and the implementation revision that produced it. When two outputs exist for one step, the history shows which one is canonical and what made each of them.

## What this doesn't buy

This isn't exactly-once execution, and cancellation is best-effort. There is one control-plane process holding all state as a single JSON document in SQLite, which is fine for a small single-owner beta and not for long histories or replication. Conformance fixtures are attested by the provider, not verified remotely. The tests cover these paths with an injected clock and two real provider processes on one host. The validation ledger is explicit that a real laptop going to sleep mid-run on a real network is still on the to-do list.
