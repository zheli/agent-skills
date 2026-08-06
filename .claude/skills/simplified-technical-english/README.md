# Simplified Technical English

## Overview

Rewrite prose into ASD-STE100 Simplified Technical English (STE) to remove "AI slop", with a deterministic linter to measure the change.

- Applies a controlled-language style: short common words, active voice, short single-instruction sentences.
- Ships `ste-lint.py`, a heuristic linter that scores a draft as violations per 100 words.
- Two modes: **strict** (procedures, safety text, error messages) and **STE-flavored** (READMEs, PR descriptions, general docs).
- Python 3 standard library only — no third-party packages.

## Use Cases

- "Make this not sound like AI."
- "Make these docs clear / plain / readable."
- "Rewrite this README, PR description, or release note."
- "Enforce a consistent, controlled writing style."
- "Fix the AI slop in this text."

Do not use it for code, marketing copy, essays, or anything that needs a distinct voice. STE removes voice on purpose.

## Prerequisites

- Python 3.

## Usage

Invoke the skill and give it the text or file to rewrite. The skill will lint the draft, rewrite it in the chosen mode, then lint the rewrite so you can see the score delta.

Run the linter directly:

```bash
# Score text from stdin (full JSON breakdown)
echo "your text" | python3 .claude/skills/simplified-technical-english/ste-lint.py

# Score one or more files (one summary line per file)
python3 .claude/skills/simplified-technical-english/ste-lint.py draft.md README.md
```

`total_per100w` is the headline number. Lower is cleaner. Lint a draft, apply the skill, then lint it again — the delta is the signal.

## What It Checks

| Category | What it flags |
|---|---|
| `long_sentence(>20w)` | Sentences over 20 words |
| `semicolon` | Semicolons (banned by STE) |
| `contraction` | Contractions such as "it's", "don't" |
| `passive_voice` | Passive voice with a known actor |
| `ing_main_verb` | "-ing" main verb where a simple tense works |
| `nominalization` | "perform an analysis" instead of "analyze" |
| `phrasal_verb` | "spin up", "reach out", "kick off", etc. |
| `banned_word` | utilize, leverage, facilitate, ensure, furthermore, etc. |
| `marketing_adjective` | seamless, robust, powerful, cutting-edge, etc. |
| `modal_hedge` | "it is important to note", "please note that", etc. |
| `long_paragraph(>6s)` | Paragraphs over six sentences |
| `em_dash(slop-marker)` | True em/en dash characters (reported separately) |

## Expected Results

- ✅ The rewrite reads in plain, direct English with short sentences.
- ✅ The linter reports a lower `total_per100w` for the rewrite than for the baseline.
- ✅ No semicolons, no contractions, no marketing adjectives, no passive voice with a known actor.

## Technical Details

- **Language**: Python 3 (standard library: `re`, `sys`, `json`, `glob`, `os`).
- **Network**: none. The linter reads files or stdin and prints a score. It makes no network calls and writes no files.
- **Scope**: covers the mechanical, machine-checkable subset of ASD-STE100. It is not a certified STE checker. Full STE also needs human judgment. This skill fixes the form of slop; it cannot make a hollow paragraph true.

## Attribution

The linter and the distilled STE rules are adapted from woosal1337/blog, ep01 "The cure for AI slop is a 1986 aircraft manual": https://github.com/woosal1337/blog/tree/main/videos/ep01-the-cure-for-ai-slop

Spec: ASD-STE100 Simplified Technical English (Issue 9), free at https://asd-ste100.org

## License

See the [LICENSE](./LICENSE) file. MIT.
