---
name: code-review
description: Dispatch a code reviewer subagent to catch issues before they cascade. Use after completing features, fixing complex bugs, or before merging.
allowed-tools: [Bash, Read, Grep, Task]
---

# Code Review

Dispatch a code reviewer subagent to evaluate completed work against requirements before issues cascade. The reviewer receives precisely crafted context — never your session history — keeping it focused on the work product.

## Prerequisites
- Git repository with at least two commits (so there is a diff range to review)
- Clear description of what was implemented and what it was supposed to do

## When to Use

**Should use:**
- After completing a major feature
- Before merging to main
- After fixing a complex bug

**Nice to have:**
- When stuck (fresh perspective)
- Before refactoring (baseline check)

## Customization Variables

| Placeholder | Description | Example |
|---|---|---|
| `{DESCRIPTION}` | Brief summary of what was built | "Added verifyIndex() and repairIndex() with 4 issue types" |
| `{PLAN_OR_REQUIREMENTS}` | What it should do — paste requirements, a plan excerpt, or task text | "Users must be able to reset their password via email link" |
| `{BASE_SHA}` | Starting commit (exclusive) | `a7981ec` |
| `{HEAD_SHA}` | Ending commit (inclusive) | `3df7661` |

## Steps

### 1. Determine Git SHAs

```bash
# HEAD SHA is always the current commit
HEAD_SHA=$(git rev-parse HEAD)

# BASE SHA: use the merge base with main/master, or the previous commit
BASE_SHA=$(git merge-base origin/main HEAD 2>/dev/null || git rev-parse HEAD~1)

echo "Reviewing: $BASE_SHA..$HEAD_SHA"
git diff --stat "$BASE_SHA".."$HEAD_SHA"
```

Choose `BASE_SHA` based on the scope of the review:
- **Single commit**: `git rev-parse HEAD~1`
- **Feature branch**: `git merge-base origin/main HEAD`
- **Specific range**: use the SHA of the last known-good commit

### 2. Gather Context

Identify what to pass as `{DESCRIPTION}` and `{PLAN_OR_REQUIREMENTS}`:

- **Description**: 1-2 sentences summarizing what you built (functions added, behavior changed, files affected)
- **Plan or requirements**: paste the task text, acceptance criteria, or relevant section of a plan document. A file path is fine if the reviewer subagent can read it.

### 3. Read the Reviewer Template

Read `code-reviewer.md` (in this skill's directory) and fill in the four placeholders:
- `{DESCRIPTION}` → your description from Step 2
- `{PLAN_OR_REQUIREMENTS}` → your requirements from Step 2
- `{BASE_SHA}` → from Step 1
- `{HEAD_SHA}` → from Step 1

### 4. Dispatch the Code Reviewer Subagent

Use the Task tool with `general` subagent type:

```
Task tool (general):
  description: "Review code changes"
  prompt: <filled-in contents of code-reviewer.md>
```

The subagent will run `git diff` against the SHA range, read the changed files, and return a structured review.

### 5. Act on Feedback

Triage the reviewer's findings by severity:

| Severity | Action |
|---|---|
| **Critical** | Fix immediately before proceeding |
| **Important** | Fix before merging |
| **Minor** | Note for later; optional before merge |

If the reviewer is wrong, push back with technical reasoning — show the code or tests that prove it works. If the review flags an issue with the plan rather than the implementation, note it separately.

## Expected Results

After the subagent returns:
- ✓ Strengths identified (confirms what is working well)
- ✓ Issues categorized as Critical / Important / Minor with file:line references
- ✓ Clear "Ready to merge?" verdict (Yes / No / With fixes)
- ✓ Actionable fix guidance for each issue

## Security Notes

- **No secrets in context**: do not paste API keys, passwords, tokens, or credentials into `{DESCRIPTION}` or `{PLAN_OR_REQUIREMENTS}`. Use placeholders like `<REDACTED>` if referencing secrets.
- **No customer data**: do not include PII or production data in review context.
- **Subagent scope**: the reviewer subagent only reads git history and source files. It does not execute code or make changes.

## Troubleshooting

### Reviewer says "no changes found"
- Verify `BASE_SHA` and `HEAD_SHA` are correct: `git log --oneline "$BASE_SHA".."$HEAD_SHA"`
- Ensure the commits exist locally: `git fetch origin` if reviewing remote commits

### Reviewer feedback is too generic
- Provide more specific `{PLAN_OR_REQUIREMENTS}` — paste the actual acceptance criteria rather than a vague summary
- Include the file paths most relevant to the change in `{DESCRIPTION}`

### Subagent cannot access the repository
- Confirm the working directory is the git repo root: `git rev-parse --show-toplevel`
- The subagent inherits the same working directory; ensure it has read access

## References

- Reviewer prompt template: `code-review/code-reviewer.md`
- Conventional Commits: https://www.conventionalcommits.org/
