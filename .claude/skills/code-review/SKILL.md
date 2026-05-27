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
| `{TEST_FILE_GLOBS}` | (Optional) Test file patterns for the project | `**/*.spec.ts`, `**/*_test.go` |

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

> **Note:** uncommitted or unstaged changes will not appear in the diff. Commit or stash any in-progress work before running the review.

Choose `BASE_SHA` based on the scope of the review:
- **Single commit**: `git rev-parse HEAD~1`
- **Feature branch**: `git merge-base origin/main HEAD`
- **Specific range**: use the SHA of the last known-good commit

### 1.25. Run PR Scope Preflight

Before dispatching the code reviewer, dispatch a separate read-only Task subagent to check whether the PR diff is reviewable and scoped correctly. This catches noisy reviews where a branch contains duplicated cherry-picks from `main`, stale replayed commits, or a much broader diff than the PR description claims.

First identify `{DESCRIPTION}` and `{PLAN_OR_REQUIREMENTS}` using the guidance in Step 2. If they are not known yet, pause and gather them before running this preflight; the scope check needs the intended change to compare against the actual diff.

Use the Task tool with `general` subagent type:

```
Task tool (general):
  description: "Check PR scope before review"
  prompt: |
    You are doing a read-only PR scope preflight before code review.

    Git range:
    Base: {BASE_SHA}
    Head: {HEAD_SHA}

    Description:
    {DESCRIPTION}

    Requirements / PR description:
    {PLAN_OR_REQUIREMENTS}

    Check for:
    1. Duplicated changes already present on origin/main or the merge-base target.
    2. Stale cherry-picks or replayed commits that reintroduce code already merged.
    3. A diff that is materially broader than the description or requirements.
    4. Unrelated file churn, generated files, lockfile/vendor updates, formatting-only rewrites, or large moves/renames that obscure the intended change.

    Run only read-only git/file inspection commands. Suggested commands:
    - git log --oneline --cherry-pick --right-only origin/main...HEAD
    - git cherry -v origin/main HEAD
    - git diff --stat {BASE_SHA}..{HEAD_SHA}
    - git diff --name-status {BASE_SHA}..{HEAD_SHA}
    - git diff --find-renames {BASE_SHA}..{HEAD_SHA}
    - git log --oneline --decorate {BASE_SHA}..{HEAD_SHA}

    If this is a GitHub PR and the PR number or URL is known, also inspect read-only PR metadata such as title, body, base branch, head branch, commit list, changed files, and merge state.

    Return:
    - Scope verdict: Clean / Needs attention / Block review
    - Duplicate or stale changes found, with evidence
    - Files or commits that appear unrelated to the description
    - Recommended action before code review: proceed, narrow the range, rebase, split PR, create a fresh PR, update description, or stop
```

If the preflight verdict is **Block review**, stop before Step 4 and offer the user these choices:
- Clean up or rebase the existing PR first
- Create a fresh PR with only the real changes
- Proceed with the noisy review anyway

If the preflight verdict is **Needs attention**, summarize the concern and ask before dispatching the code reviewer unless the user already explicitly requested reviewing despite stale or duplicated changes.

Preflight must not rely only on commit SHAs: squash merges, cherry-picks, rebases, and backports can make commit identity misleading. Ask the subagent to compare content, file scope, and PR description as well as commit history.

### 1.5. Gather Test Context

Before dispatching the reviewer, check the test-to-source ratio of the diff:

```bash
# Source files changed (excluding tests)
git diff --name-only "$BASE_SHA".."$HEAD_SHA" -- \
  ':(exclude)*test*' ':(exclude)*spec*' ':(exclude)*_test.*' \
  ':(exclude)test_*' ':(exclude)__tests__/*'

# Test files changed
git diff --name-only "$BASE_SHA".."$HEAD_SHA" | grep -E '(test|spec|_test\.|test_|__tests__)'
```

If the project has a `{TEST_FILE_GLOBS}` pattern, use that instead of the defaults. This context helps the reviewer build the **Test impact map** from `test-review-checklist.md`.

### 2. Gather Context

Identify what to pass as `{DESCRIPTION}` and `{PLAN_OR_REQUIREMENTS}`:

- **Description**: 1-2 sentences summarizing what you built (functions added, behavior changed, files affected)
- **Plan or requirements**: paste the task text, acceptance criteria, or relevant section of a plan document. A file path is fine if the reviewer subagent can read it.

### 3. Read the Reviewer Template

Read `code-reviewer.md` — it is in the same directory as this SKILL.md file. Use the `Read` tool with the full path to locate it. Fill in the four placeholders in the content after the first horizontal rule (`---`):
- `{DESCRIPTION}` → your description from Step 2
- `{PLAN_OR_REQUIREMENTS}` → your requirements from Step 2
- `{BASE_SHA}` → from Step 1
- `{HEAD_SHA}` → from Step 1

### 4. Dispatch the Code Reviewer Subagent

Use the Task tool with `general` subagent type. Pass **everything after the first `---` in `code-reviewer.md`** (with placeholders filled in) as the prompt:

```
Task tool (general):
  description: "Review code changes"
  prompt: <filled-in prompt from code-reviewer.md, starting after the first horizontal rule>
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
- ✓ PR scope preflight completed, or explicitly skipped with user approval
- ✓ Duplicated main-branch changes, stale cherry-picks, or oversized diffs identified before review
- ✓ Strengths identified (confirms what is working well)
- ✓ Issues categorized as Critical / Important / Minor with file:line references
- ✓ **Test impact map** showing test coverage for each changed source file
- ✓ **Untested changes** list (or confirmation that all behavior is covered)
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

### Preflight says the PR is stale or duplicated
- Prefer cleaning up the PR before review: rebase on the target branch, drop duplicated cherry-picks, or create a fresh branch with only the intended changes
- If the duplication is intentional, such as a backport or release-branch cherry-pick, document that in `{PLAN_OR_REQUIREMENTS}` and proceed only after the user confirms
- If the PR description is narrower than the diff, ask the user whether to split the PR, update the description, or review only a narrower SHA range

### Reviewer feedback is too generic
- Provide more specific `{PLAN_OR_REQUIREMENTS}` — paste the actual acceptance criteria rather than a vague summary
- Include the file paths most relevant to the change in `{DESCRIPTION}`

### Subagent cannot access the repository
- Confirm the working directory is the git repo root: `git rev-parse --show-toplevel`
- The subagent inherits the same working directory; ensure it has read access

## References

- Reviewer prompt template: `./code-reviewer.md` (same directory as this file)
- Test review checklist: `./test-review-checklist.md` (same directory as this file)
- Based on: [obra/superpowers requesting-code-review](https://github.com/obra/superpowers/tree/main/skills/requesting-code-review)
