---
name: comment-why-not-how
description: >-
  Rewrite code comments into one causal sentence that states why, not what the
  code does. Use whenever adding or editing comments, docstrings, doc comments
  (JSDoc, Haddock, godoc, rustdoc), or test case notes, in any language, or when
  the user asks to simplify or tighten comment writing.
---

# Comment why, not how

Apply this to every comment you add or rewrite in the current session. Do not
drive-by rewrite unrelated existing comments.

## Rule

A comment records a **non-obvious why**. Say it once. The code below already
shows the what.

Prefer one causal sentence: `Must X so Y` or `X so that Y`.

If you wrote "therefore", "i.e.", or "we need … to … at all", you already said
the conclusion twice. Keep only the conclusion.

## Cut

- Domain lectures that restate what a reader can look up
- Stacked equivalent facts (A ↔ B ↔ so we need C)
- Narration of the next line (`// set retries to 3`)
- Throat-clearing (`We therefore need`, `in order to`, `at all`, `Note that`)
- Change-log chatter (`previously this used X`, `added for ticket-123`) — that
  belongs in the commit message

Two sentences are fine only when they carry two different facts, not a
restatement plus an inference.

## Keep

- The file's existing comment dialect and syntax: `//`, `#`, `--`, `/** */`,
  `"""docstring"""`, `-- |` Haddock, `///` rustdoc, and test markers such as
  `-- Happy` / `-- Unhappy`
- Named constraints and identifiers, in the code-reference markup the file
  already uses (backticks, `{@link}`, `[Type]`)
- Copyright, SPDX, lint pragmas, and section banners
- Comments that carry tooling meaning (`# noqa`, `//nolint`, `# type: ignore`
  justifications, generated-file headers)

## Language notes

- **Docstrings and API docs** (Python docstrings, JSDoc, Haddock, godoc,
  rustdoc): keep the required structure (summary line, parameter and return
  tags) and apply the one-causal-sentence rule to the prose inside it.
- **godoc** wants the sentence to start with the identifier name; keep that and
  cut the rest to one clause.
- **Tests**: name the fact the assertion proves, not the steps it performs.

## Examples

**Before** (three sentences, one fact):

```python
# The cache key includes the tenant id, and entries for different tenants must
# never collide because tenants can read their own cache. We therefore need the
# tenant id in the key at all.
```

**After:**

```python
# Key by tenant so one tenant cannot read another's cached rows.
```

**Before** (narrates the next line):

```typescript
// Set the timeout to 30 seconds
const timeoutMs = 30_000;
```

**After** — state the why, or delete the comment:

```typescript
// Upstream gateway drops idle connections at 35s, so fail first and retry.
const timeoutMs = 30_000;
```

**Before** (restates the test's purpose):

```go
// Happy - the request works again, which confirms that the rejection above was
// caused by the rate limiter rather than by anything else in that request.
```

**After:**

```go
// Happy - the request works again, so the earlier rejection was the rate limiter.
```

**Before** (domain lecture, one conclusion):

```haskell
-- | A transfer pre-approval is only paid for the part of its duration that exceeds
-- `basePreapprovalDuration`, and only a paid one burns tokens. We therefore need a
-- long-lived pre-approval to exercise the `splitAndBurn` code path at all.
```

**After:**

```haskell
-- | Must exceed `basePreapprovalDuration` so creating the pre-approval burns
-- tokens via `splitAndBurn`.
```

**Leave alone** (two different facts: missing lookup, then fail-closed policy):

```rust
/// `send_v2` never resolves the rules contract, so the blacklist cannot be checked
/// there. Minting through it must therefore fail closed, even when nobody is
/// blacklisted.
```
