# Code Review

A skill for dispatching a code reviewer subagent to evaluate completed work against requirements before issues cascade.

## Overview

This skill automates the code review workflow by:
- Determining the correct git SHA range to review
- Prompting you to supply a description and requirements
- Filling in the reviewer prompt template (`code-reviewer.md`)
- Dispatching a senior code reviewer subagent via the Task tool
- Guiding you through triaging Critical / Important / Minor feedback

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

## Usage

Invoke the skill: `/code-review`

The skill will guide you through:
1. Determining `BASE_SHA` and `HEAD_SHA`
2. Writing a brief description of what was built
3. Supplying the requirements or plan the work was built against
4. Dispatching the reviewer subagent
5. Triaging the returned feedback

No configuration files are required.

## What Gets Configured

| Component | Details |
|---|---|
| Git range | `BASE_SHA..HEAD_SHA` — determined from your current branch |
| Review context | Description + requirements you provide |
| Reviewer prompt | Filled from `code-reviewer.md` template |
| Subagent type | `general` via the Task tool |

## Feedback Triage

| Severity | Action |
|---|---|
| **Critical** | Fix immediately before proceeding |
| **Important** | Fix before merging |
| **Minor** | Note for later; optional before merge |

If the reviewer is wrong, push back with technical reasoning. If the reviewer flags an issue with the requirements rather than the implementation, note it separately.

## Security Considerations

- **No secrets in context**: do not paste API keys, passwords, tokens, or credentials into the description or requirements fields. Use placeholders like `<REDACTED>`.
- **No customer data or PII**: do not include production data in review context.
- **Read-only subagent**: the reviewer only reads git history and source files. It does not execute code or make changes.

## Expected Results

After the reviewer subagent returns:
- Strengths identified (confirms what is working well)
- Issues categorized as Critical / Important / Minor with file:line references
- Clear "Ready to merge?" verdict (Yes / No / With fixes)
- Actionable fix guidance for each issue

## Troubleshooting

| Problem | Solution |
|---|---|
| "No changes found" | Verify SHAs with `git log --oneline "$BASE_SHA".."$HEAD_SHA"` |
| Feedback is too generic | Provide more specific requirements — paste actual acceptance criteria |
| Subagent can't access repo | Confirm working directory is repo root: `git rev-parse --show-toplevel` |

## Technical Details

- **Subagent type**: `general` (Task tool)
- **Reviewer template**: `code-reviewer.md` in this skill directory
- **Review scope**: git diff between `BASE_SHA` and `HEAD_SHA`, plus full file reads for significantly changed files
- **Based on**: [obra/superpowers requesting-code-review](https://github.com/obra/superpowers/tree/main/skills/requesting-code-review)

## License

MIT License — see [LICENSE](./LICENSE) for details.
