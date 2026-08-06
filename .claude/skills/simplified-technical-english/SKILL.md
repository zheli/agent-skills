---
name: simplified-technical-english
description: Rewrite prose (docs, READMEs, PR descriptions, error messages, release notes, comments — never code) into ASD-STE100 Simplified Technical English to remove "AI slop". Use when asked to make writing not sound like AI, make docs clear or plain, enforce a controlled writing style, or write technical documentation that reads human. Includes a deterministic linter to measure the change.
allowed-tools: [Read, Write, Edit, Bash, Grep]
---

# Simplified Technical English

## Purpose

Rewrite prose into ASD-STE100 Simplified Technical English (STE) to remove "AI slop". STE is a controlled language for technical documentation. It uses short common words, active voice, and short single-instruction sentences.

This skill applies to documentation, READMEs, pull-request text, error messages, release notes, and comments. It does not apply to code, identifiers, or command syntax. It is not for marketing copy, essays, or anything that needs a voice — STE strips voice on purpose.

The skill ships a heuristic linter (`ste-lint.py`) that scores a draft. The score is violations per 100 words. Lint a draft, apply the rules, then lint again. The delta between the two scores is the signal.

## Prerequisites

- Python 3 (standard library only — no third-party packages).

## When to Use This Skill

Use this skill when the user asks for any of:

- "Make this not sound like AI"
- "Make these docs clear / plain / readable"
- "Rewrite this README / PR description / release note"
- "Enforce a controlled or consistent writing style"
- "Write technical documentation that reads human"
- "Fix the AI slop in this text"

Do **not** use this skill when:

- The text is code, identifiers, or command syntax.
- The text is marketing copy, an essay, or anything that needs a distinct voice. STE removes voice.

## Modes

- **strict** — procedures, runbooks, safety text, error messages. Apply every rule and both length caps.
- **STE-flavored** — general prose (READMEs, PR descriptions, docs). Apply the sentence, paragraph, active-voice, and no-phrasal-verb rules. Relax the ~900-word dictionary lockdown so the text keeps enough range to read naturally.

Ask the user which mode they want if it is not clear. Default to STE-flavored for general prose.

## The Rules

### Words

- Use one name for one thing. Do not call the same item by two different names.
- Use the short common word: start (not begin/commence/initiate), use (not utilize/leverage), help (not facilitate), make sure (not ensure), before (not prior to), after (not subsequent to), about (not regarding/concerning), get (not obtain/acquire), show (not demonstrate), also (not additionally/furthermore/moreover).
- Give each word one meaning. "fall" means to move down, not to decrease.
- No marketing adjectives: seamless, robust, powerful, cutting-edge, effortless, world-class, next-generation, revolutionary.
- American spelling.

### Verbs

- Active voice. "the parser reads the file", not "the file is read by the parser".
- Use a verb for an action. "analyze the log", not "perform an analysis of the log".
- No stacked auxiliaries. Not "it is important to note that this may help to improve". Write "this improves X".
- No "-ing" main verb where a simple tense works.

### Sentences

- One instruction per sentence. Max 20 words (instruction), max 25 (descriptive).
- No contractions. Use articles: a, an, the, this, these.

### Punctuation

- No semicolons. Write two sentences. The em dash is not banned by STE, only the semicolon is. Add "no em dash" yourself if you want it gone.

### Structure

- One topic per paragraph, max six sentences. For steps, use a numbered vertical list, one action per item, imperative form. Put a condition before its command.

Write only the requested text. No preamble, no summary, no closing remarks.

## Workflow

1. Read the source draft with the `Read` tool.
2. Lint the original draft to get the baseline score:

   ```bash
   python3 .claude/skills/simplified-technical-english/ste-lint.py path/to/draft.md
   ```

3. Rewrite the prose with the rules above, in the chosen mode.
4. Run the self-lint checklist (below) on your rewrite before returning it.
5. Lint the rewrite and compare it to the baseline. A lower per-100-words score means less slop.
6. Report the before and after scores so the user sees the delta.

## Self-lint (run before returning text)

1. Any sentence over 20 words? Split it.
2. Any semicolon? Replace with a period.
3. Any contraction? Expand it.
4. Any passive voice with a known actor? Make it active.
5. Any "-ing" main verb, nominalization ("perform an analysis"), or phrasal verb ("spin up")? Replace with a plain verb.
6. Same thing named two ways? Pick one name.

## Running the linter

Score from stdin:

```bash
echo "your text" | python3 .claude/skills/simplified-technical-english/ste-lint.py
```

Score one or more files (summary table, one line per file):

```bash
python3 .claude/skills/simplified-technical-english/ste-lint.py draft.md README.md
```

The stdin form prints a full JSON breakdown. `total_per100w` is the headline number — lower is cleaner. `em_dash(slop-marker)` counts true em/en dash characters as a separate slop marker.

## Expected Results

- ✅ The rewrite reads in plain, direct English with short sentences.
- ✅ The linter reports a lower `total_per100w` for the rewrite than for the baseline.
- ✅ No semicolons, no contractions, no marketing adjectives, no passive voice with a known actor.

## Troubleshooting

- **`python3: command not found`** — install Python 3, or use `python` if that is your Python 3.
- **Score did not drop** — check the `sample_banned` and `sample_marketing` fields and the per-category `violations` in the JSON output to find what remains.
- **The linter is not a certified STE checker.** It covers the mechanical, machine-checkable subset of ASD-STE100 — which is where the slop lives. Full STE also needs human judgment (the right technical noun, whether a sentence "makes good sense"). This skill fixes the form of slop. It cannot make a hollow paragraph true.

## References

- ASD-STE100 Simplified Technical English (Issue 9), free spec: https://asd-ste100.org (copyrighted — do not paste the full spec into prompts).
- Source and method: woosal1337/blog, ep01 "The cure for AI slop is a 1986 aircraft manual" — https://github.com/woosal1337/blog/tree/main/videos/ep01-the-cure-for-ai-slop
