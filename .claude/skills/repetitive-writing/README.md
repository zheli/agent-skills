# Repetitive or Over-Explaining Writing

## Overview

Checks prose for repetition and over-explaining. It judges density of claims, not sentence length.

- Flags restated decisions, extra examples, implementation dumps, and facts already owned by a table or later section.
- Proposes a tighter rewrite. Does not edit unless asked.
- Complements Simplified Technical English. STE is diction; this skill is content.

## Use Cases

- "Is this repetitive?"
- "Talking too much?"
- "Over-explaining?"
- "Tighten this."
- Reviewing docs, RFPs, architecture text, READMEs, or proposals.

Do not use it for code, identifiers, or command syntax. Do not use it when the user asked only for an STE / "not AI" rewrite.

## Prerequisites

None. The skill is judgment-only. It has no linter and makes no network calls.

## Usage

Invoke the skill and point at a passage or a file.

- A passage: review that passage.
- A file: report the worst three to five hits, not a laundry list.

The skill answers first, then proposes a tighter version. Apply the rewrite only when asked.

## What It Flags

| Mode | What it looks like |
|---|---|
| Claim then conclusion | Thesis sentence, then "therefore" restates the same decision |
| Over-proving | Three named examples where one shows the mechanism |
| Implementation dump | Function names, types, or file paths in a policy/version paragraph |
| Table echo | Prose repeats a table cell the reader just saw |
| Owned elsewhere | Later section already states the CI gate or acceptance rule |
| Stacked topic | A second, true fact bolted onto a paragraph that already closed |
| Explaining the obvious | "rather than being chosen independently" after "the pin follows X" |

It keeps the fact a reviewer would not infer from the table or heading. It drops the rest, including operational checks owned by a later gate.

## Expected Results

- ✅ Verdict of repetitive, over-explaining, both, or neither.
- ✅ Named cuts: restated decisions, extra proof, and owned-elsewhere facts.
- ✅ A tighter rewrite that does not keep a sentence the verdict just flagged.
- ✅ No edit unless the user asked to apply it.

## License

See the [LICENSE](./LICENSE) file. MIT.
