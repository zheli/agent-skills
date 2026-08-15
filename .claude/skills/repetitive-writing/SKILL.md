---
name: repetitive-writing
description: >
  Checks prose for repetition and over-explaining: restated claims, extra
  examples, implementation dumps, and facts already owned by a table or later
  section. Use when the user asks if writing is repetitive, talking too much,
  over-explaining, too long, verbose, or wants a paragraph tightened. Applies
  to docs, RFPs, architecture text, READMEs, and proposals — not code.
allowed-tools: [Read, Write, Edit, Grep]
---

# Repetitive or Over-Explaining Writing

Judge density of claims, not sentence length. Short sentences can still restate
the same decision. Long sentences can still carry one necessary fact.

This is not Simplified Technical English. Do not rewrite diction, voice, or
sentence caps unless the user also asked for that.

## When to Use This Skill

Use this skill when the user asks for any of:

- "Is this repetitive?"
- "Talking too much?"
- "Over-explaining?"
- "Tighten this"
- Reviewing docs, RFPs, TADs, READMEs, proposals

Do **not** use this skill when:

- The text is code, identifiers, or command syntax
- Spec or contract text that must repeat a requirement in a dedicated gate
  section — note the echo, do not delete the gate
- The user asked only for an STE / "not AI" rewrite

## Workflow

1. Read the target passage with the Read tool.
2. Read surrounding context: the table above, the next heading, and any later
   section that already owns the same gate or number.
3. List distinct claims. Mark each as **keep**, **restate**, **over-prove**,
   or **owned elsewhere**.
4. Answer first. Propose a tighter version. Do not edit unless asked.

If the user pointed at a passage, review that passage. If they pointed at a
file, report the worst three to five hits, not a laundry list.

## Failure Modes

Flag these. One hit is enough to call the passage over-explained.

| Mode | What it looks like |
|---|---|
| Claim then conclusion | Thesis sentence, then "therefore" restates the same decision |
| Over-proving | Three named examples where one shows the mechanism |
| Implementation dump | Function names, types, or file paths in a policy/version paragraph |
| Table echo | Prose repeats a table cell the reader just saw |
| Owned elsewhere | Later section already states the CI gate or acceptance rule |
| Stacked topic | A second, true fact bolted onto a paragraph that already closed |
| Explaining the obvious | "rather than being chosen independently" after "the pin follows X" |

Do not flag:

- One concrete mechanism a reviewer would not guess
- A single example that shows *why* a rule exists
- A cross-reference to a later gate instead of restating it

## What to Keep

Keep the fact a reviewer would not infer from the table or heading. Drop the
rest.

Typical keepers: the surprising mechanism, one reason it matters, the
operational check if this section owns it.

## Output

Lead with the verdict. Then the cuts. Then a tighter rewrite in a quote block.

```
Verdict: repetitive | over-explaining | both | neither

Same decision N times:
- ...

Over-explained:
- ...

Already owned elsewhere:
- ...

Keep:
- ...

Tighter:
> ...
```

If neither, say so in one or two sentences. Do not invent cuts.

## Example

**Draft (too much):** the SDK pin follows `@x402/stellar`; it is a direct
dependency `^16.0.1` not a peer, so a divergent pin installs a nested copy;
three public APIs pass SDK objects; two copies break types and `instanceof`;
therefore pin one version and CI asserts a single copy; 16.x is Protocol 27.

**Why it fails:** the decision is stated three times (follows X; therefore pin
one; CI asserts a single copy). Three API names over-prove. The CI check is
already owned by a later gate, so this paragraph must not restate it.

**Tighter:**

> The `@stellar/stellar-sdk` pin follows `@x402/stellar` 2.22.0 (`^16.0.1`, a
> direct dependency, not a peer). A divergent root pin installs a second copy
> and breaks types and `instanceof` where SDK objects cross that API. 16.x is
> the Protocol 27 line (`p27`); 15.x targets Protocol 26.
