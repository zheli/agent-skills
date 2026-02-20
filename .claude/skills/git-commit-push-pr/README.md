# Git Commit, Push, and Pull Request

A Claude skill for committing all changes, pushing to a remote, and creating a GitHub pull request with an auto-generated, well-structured description.

## Overview

This skill automates the full workflow from local changes to a GitHub pull request by:
- Detecting the repository's default branch automatically
- Creating a feature branch if currently on the default branch
- Staging all tracked and untracked changes
- Generating a meaningful commit message based on the diff
- Pushing the branch to the remote with upstream tracking
- Checking for an existing open PR on the branch
- Creating a new PR with a structured description (Summary, Changes, Notes) if none exists

## Use Cases

- Wrapping up a coding session and submitting changes for review
- Quickly opening a PR after finishing a feature or bug fix
- Ensuring all local work is pushed and a PR is created in one step
- Resuming work on an existing branch and pushing additional commits to an open PR

## Prerequisites

Before using this skill, ensure you have:
- A Git repository with a GitHub remote configured (`git remote -v`)
- The `gh` CLI installed and authenticated (`gh auth status`)
- At least one prior commit on the repository's default branch
- Uncommitted or unstaged changes in the working tree

## Usage

1. Invoke the skill: `@git-commit-push-pr`
2. The skill will automatically:
   - Detect the default branch and current branch
   - Create a feature branch if on the default branch
   - Stage, commit, and push all changes
   - Create a PR or report the existing one
3. Review the output for the PR URL

No manual input is required -- all values are auto-detected from the repository state.

## What Gets Configured

| Component | Configuration |
|-----------|---------------|
| Branch | Auto-creates a feature branch if on the default branch |
| Staging | All tracked and untracked changes staged via `git add -A` |
| Commit | Meaningful message with conventional commit prefix (feat/fix/docs/etc.) |
| Push | Branch pushed to origin with upstream tracking (`-u`) |
| Pull Request | Created with structured description (Summary, Changes, Notes) |
| Idempotency | Skips PR creation if one already exists for the branch |

## Security Considerations

- **Sensitive files**: The skill stages all changes. Review the diff to ensure no secrets (`.env`, credentials, API keys) are included. The agent will warn if potentially sensitive files are detected.
- **Authentication**: Requires `gh` CLI to be authenticated with sufficient permissions to create PRs.
- **No force push**: This skill never uses `--force`. All git operations are safe and non-destructive.
- **Branch protection**: The skill respects branch protection rules. It creates PRs rather than pushing directly to the default branch.

## Expected Results

After successful execution:
- ✅ All changes committed with a descriptive commit message
- ✅ Branch pushed to the GitHub remote
- ✅ Pull request created with a structured description (or existing PR URL displayed)
- ✅ PR URL output for easy access and review

## Troubleshooting

### `gh` CLI Not Authenticated
- Run `gh auth login` and follow the interactive prompts
- Verify authentication: `gh auth status`

### No GitHub Remote Configured
- Check remotes: `git remote -v`
- Add a remote: `git remote add origin https://github.com/<OWNER>/<REPO>.git`

### Push Rejected (Remote Branch Diverged)
- This skill does not force-push; resolve conflicts manually
- Pull the latest changes: `git pull --rebase origin <branch>`

### PR Creation Fails (Insufficient Permissions)
- Ensure your GitHub token has the `repo` scope
- Check repository branch protection rules

### No Changes to Commit
- The skill exits early if the working tree is clean
- Verify with `git status` that there are uncommitted changes

## Technical Details

- **Required tools**: `git`, `gh` (GitHub CLI)
- **Execution time**: ~10-30 seconds depending on diff size and network
- **Commit format**: Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, etc.)
- **PR description format**: Markdown with Summary, Changes, and Notes sections
- **Branch naming**: `feat/<primary-directory>` when auto-creating from the default branch

## License

See [LICENSE](./LICENSE) file for details.
