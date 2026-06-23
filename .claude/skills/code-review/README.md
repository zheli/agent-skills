# Code Review

A skill for dispatching a code reviewer subagent to evaluate completed work against requirements before issues cascade.

## Overview

This skill automates the code review workflow by:
- Determining the correct git SHA range to review
- Running a read-only PR scope preflight for duplicated main-branch changes, stale cherry-picks, and unexpectedly broad diffs
- Prompting you to supply a description and requirements
- Filling in the reviewer prompt template (`code-reviewer.md`)
- Dispatching a senior code reviewer subagent via the Task tool
- Guiding you through triaging Critical / Important / Minor feedback
- Optionally preparing GitHub PR review comments with explicit user approval before posting

The reviewer subagent receives only the diff and your context — never your session history — keeping the review focused on the work product.

## Use Cases

- Catching bugs before they compound into larger problems
- Verifying an implementation matches its requirements before merging
- Getting a fresh perspective when stuck on a complex problem
- Establishing a quality baseline before a refactor

## Prerequisites

- Git repository with at least two commits (a reviewable diff range)
- The `git` CLI available in the working directory
- Clear understanding of what was implemented and what it was supposed to do
- Optional, for GitHub PR comments: `gh` CLI installed and authenticated

## Usage

Invoke the skill: `/code-review`

The skill will guide you through:
1. Determining `BASE_SHA` and `HEAD_SHA`
2. Writing a brief description of what was built
3. Supplying the requirements or plan the work was built against
4. Dispatching a read-only PR scope preflight subagent
5. Dispatching the reviewer subagent
6. Triaging the returned feedback
7. Optionally drafting GitHub PR review comments and posting only after explicit approval

No configuration files are required.

## What Gets Configured

| Component | Details |
|---|---|
| Git range | `BASE_SHA..HEAD_SHA` — determined from your current branch |
| PR scope preflight | Read-only `general` subagent checks for duplicate main changes, stale cherry-picks, and scope drift before review |
| Review context | Description + requirements you provide |
| Reviewer prompt | Filled from `code-reviewer.md` template |
| Subagent type | `general` via the Task tool |
| GitHub PR comments | Optional pending review created with `gh api` only after user approval |

## Feedback Triage

| Severity | Action |
|---|---|
| **Critical** | Fix immediately before proceeding |
| **Important** | Fix before merging |
| **Minor** | Note for later; optional before merge |

If the reviewer is wrong, push back with technical reasoning. If the reviewer flags an issue with the requirements rather than the implementation, note it separately.

## GitHub PR Review Comments

When you want review findings posted to a GitHub pull request, the skill uses a safe approval workflow:

1. Ask whether to prepare GitHub PR review comments from the local findings.
2. Draft only actionable line comments with valid file and line references.
3. Show the exact comments, event type, target commit, and overall review body.
4. Ask for explicit approval before posting.
5. Create a pending GitHub review and submit it as one batched review.

The skill never posts GitHub review comments automatically. Approval to run the review is separate from approval to post public PR comments.

## Security Considerations

- **No secrets in context**: do not paste API keys, passwords, tokens, or credentials into the description or requirements fields. Use placeholders like `<REDACTED>`.
- **No customer data or PII**: do not include production data in review context.
- **Read-only subagent**: the reviewer only reads git history and source files. It does not execute code or make changes.
- **Public PR comments**: GitHub review comments may be public and persistent. The skill must show the exact payload and get explicit approval before posting.

## Expected Results

After the reviewer subagent returns:
- PR scope preflight completed, or explicitly skipped with user approval
- Duplicated main-branch changes, stale cherry-picks, or oversized diffs identified before review
- Strengths identified (confirms what is working well)
- Issues categorized as Critical / Important / Minor with file:line references
- **Test impact map** showing coverage status for each changed source file
- **Untested changes** list identifying gaps in test coverage
- Clear "Ready to merge?" verdict (Yes / No / With fixes) — influenced by test gaps
- Actionable fix guidance for each issue
- Optional GitHub review comment candidates suitable for user approval
- If requested and approved, one pending GitHub review submitted with batched comments

## Troubleshooting

| Problem | Solution |
|---|---|
| "No changes found" | Verify SHAs with `git log --oneline "$BASE_SHA".."$HEAD_SHA"` |
| Preflight blocks review | Rebase, drop duplicate cherry-picks, split the PR, create a fresh PR, or proceed only after explicit user confirmation |
| Feedback is too generic | Provide more specific requirements — paste actual acceptance criteria |
| Subagent can't access repo | Confirm working directory is repo root: `git rev-parse --show-toplevel` |
| GitHub comments cannot post | Verify `gh --version`, `gh auth status`, and that the comment lines are part of the PR diff |

## Technical Details

- **Subagent type**: `general` (Task tool)
- **Preflight subagent**: read-only scope check runs before the reviewer and can block noisy reviews until the user chooses how to proceed
- **Reviewer template**: `code-reviewer.md` in this skill directory
- **Test review checklist**: `test-review-checklist.md` in this skill directory
- **Review scope**: git diff between `BASE_SHA` and `HEAD_SHA`, plus full file reads for significantly changed files
- **Based on**: [obra/superpowers requesting-code-review](https://github.com/obra/superpowers/tree/main/skills/requesting-code-review)
- **GitHub review workflow inspired by**: [aidankinzett/claude-git-pr-skill](https://github.com/aidankinzett/claude-git-pr-skill)

## License

MIT License — see [LICENSE](./LICENSE) for details.
