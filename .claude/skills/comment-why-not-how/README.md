# Comment Why, Not How

## Overview

Keeps code comments short and useful by enforcing one rule: a comment states a
non-obvious **why**, once. The code below it already shows the what.

- Language-agnostic: works with `//`, `#`, `--`, `/** */`, docstrings, Haddock,
  godoc, and rustdoc
- Applies only to comments you add or edit in the current session
- Preserves each file's existing comment dialect and doc-tool structure

## Use Cases

- Writing or editing comments and doc comments in any language
- Tightening AI-generated comments that restate the next line
- Cleaning up test case notes that repeat the test's purpose
- Reviewing a diff where comments grew longer than the code

## Prerequisites

None. The skill is a writing rule, not a tool.

## Usage

Load the skill and keep coding; it applies to every comment you write:

```
Use the comment-why-not-how skill while adding comments to src/payments.ts
```

Or apply it to comments in a diff:

```
Apply comment-why-not-how to the comments in my current changes
```

## What Gets Changed

| Item | Action |
|------|--------|
| Comments added or edited this session | Rewritten to one causal sentence |
| Narration of the next line | Removed, or replaced with the reason |
| Stacked restatements and inferences | Reduced to the conclusion |
| Unrelated existing comments | Left untouched |
| Copyright, SPDX, lint pragmas, banners | Left untouched |
| Docstring structure (params, returns) | Kept; only the prose is tightened |

## Expected Results

- ✅ Each new comment answers "why", not "what"
- ✅ Comments are one sentence unless they carry two distinct facts
- ✅ The file's comment style and doc-tool tags are unchanged
- ✅ No drive-by edits to comments outside the current work

## Troubleshooting

**Comment feels too short to explain the situation**
Two sentences are allowed when they carry two different facts. A restatement
plus its inference is still one fact.

**Doc generator complains after a rewrite**
Structural tags (`@param`, `Args:`, `# Returns`) are required content, not
prose. Restore the tag and shorten only the sentence inside it.

**The why is really in the ticket**
Reference the constraint by name in the code (`basePreapprovalDuration`), not
the ticket id. Ticket history belongs in the commit message.

## Technical Details

- Applies to: any language with comments
- Scope: comments added or edited in the current session only
- Output: one causal sentence, in the form `Must X so Y` or `X so that Y`

## License

MIT License. See [LICENSE](./LICENSE).
