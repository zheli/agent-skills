---
name: git-commit-push-pr
description: Commit all changes, push to remote, and create a GitHub pull request with an auto-generated description if one doesn't already exist.
allowed-tools: [Bash, Read, Grep]
---

# Git Commit, Push, and Pull Request

## Purpose
Stage all changes, commit with a meaningful message, push to the remote, and create a GitHub pull request with a well-structured description. If a PR already exists for the current branch, it skips creation and outputs the existing PR URL.

## Prerequisites
- Git repository with a GitHub remote configured
- `gh` CLI installed and authenticated (`gh auth status`)
- At least one prior commit on the default branch (main/master)
- Uncommitted changes in the working tree

## When to Use This Skill
Use this skill when you need to:
- Commit all current changes and open a pull request in one step
- Push a feature branch and create a PR with a good description
- Ensure a PR exists for the current branch after making changes
- Quickly wrap up work and submit it for review

## Customization Variables
No manual placeholders required. All values are auto-detected:
- **Default branch**: Detected via `gh repo view --json defaultBranchRef`
- **Current branch**: Detected via `git branch --show-current`
- **Commit message**: Generated from the staged diff summary
- **PR title and body**: Generated from the commit log and diff against the base branch

## Steps

### 1. Detect the Default Branch
```bash
# Get the repository's default branch name (main, master, develop, etc.)
DEFAULT_BRANCH=$(gh repo view --json defaultBranchRef --jq '.defaultBranchRef.name')
echo "Default branch: $DEFAULT_BRANCH"
```

### 2. Check Current Branch and Create Feature Branch if Needed
```bash
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"

# If on the default branch, create a new feature branch
if [ "$CURRENT_BRANCH" = "$DEFAULT_BRANCH" ]; then
  # Derive a branch name from the changed files
  # Look at the diff stat to determine a descriptive name
  CHANGED_SUMMARY=$(git diff --stat --no-color | tail -1)
  CHANGED_DIRS=$(git diff --name-only | head -5 | xargs -I{} dirname {} | sort -u | head -1)

  # Generate a branch name based on the primary directory of changes
  # The agent should pick a meaningful name based on what the changes actually do
  BRANCH_NAME="feat/${CHANGED_DIRS//\//-}"
  # Clean up the branch name: lowercase, replace special chars
  BRANCH_NAME=$(echo "$BRANCH_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9\/-]/-/g' | sed 's/--*/-/g' | sed 's/-$//')

  echo "Creating feature branch: $BRANCH_NAME"
  git checkout -b "$BRANCH_NAME"
  CURRENT_BRANCH="$BRANCH_NAME"
fi
```

### 3. Stage All Changes
```bash
# Stage all tracked and untracked changes
git add -A

# Verify there are changes to commit
if git diff --cached --quiet; then
  echo "ERROR: No changes to commit. Working tree is clean."
  exit 1
fi

# Show summary of staged changes
echo "Staged changes:"
git diff --cached --stat
```

### 4. Generate a Commit Message and Commit
```bash
# Analyze the staged changes to build a meaningful commit message
# The agent should examine the diff to determine:
# - Type prefix: feat, fix, docs, refactor, chore, test, style
# - Scope: primary area of change (optional)
# - Summary: concise description of what changed and why

# Review the diff for context
git diff --cached --stat
git diff --cached --name-only

# Commit with the generated message
# Example format: "feat(auth): add OAuth2 login flow"
# Example format: "fix: resolve null pointer in user lookup"
# Example format: "docs: update API reference for v2 endpoints"
git commit -m "<generated commit message>"
```

### 5. Push to Remote
```bash
# Push the branch to origin, setting upstream tracking
git push -u origin "$CURRENT_BRANCH"

# Verify push succeeded
echo "Branch pushed: $CURRENT_BRANCH"
```

### 6. Check for Existing Pull Request
```bash
# Check if a PR already exists for this branch
EXISTING_PR=$(gh pr list --head "$CURRENT_BRANCH" --state open --json number,url --jq '.[0].url')

if [ -n "$EXISTING_PR" ]; then
  echo "PR already exists: $EXISTING_PR"
  echo "New commits have been pushed to the existing PR."
  # Stop here - no need to create a new PR
  exit 0
fi

echo "No existing PR found. Will create one."
```

### 7. Generate PR Description and Create Pull Request
```bash
# Gather information for the PR description
# - Commit log since diverging from the default branch
# - Diff stat against the default branch
# - File-level changes for context

COMMIT_LOG=$(git log "$DEFAULT_BRANCH"..HEAD --pretty=format:"- %s" --no-merges)
DIFF_STAT=$(git diff "$DEFAULT_BRANCH"...HEAD --stat)
CHANGED_FILES=$(git diff "$DEFAULT_BRANCH"...HEAD --name-only)

# The agent should analyze the above to produce a structured PR body:
#
# ## Summary
# <1-3 bullet points describing the overall purpose of the changes>
#
# ## Changes
# <bullet list of specific changes made, grouped logically>
#
# ## Notes
# <any additional context, testing notes, or considerations>

# Create the PR with a descriptive title and body
# Title should match the primary commit message or summarize all changes
gh pr create \
  --base "$DEFAULT_BRANCH" \
  --title "<descriptive PR title>" \
  --body "$(cat <<'EOF'
## Summary
<1-3 bullet points summarizing the purpose>

## Changes
<bullet list of changes>

## Notes
<additional context or testing notes>
EOF
)"

# Output the new PR URL
gh pr view --json url --jq '.url'
```

## Expected Results
After running all steps, you should have:
- ✓ All changes staged and committed with a meaningful commit message
- ✓ Branch pushed to the remote repository
- ✓ Pull request created (or existing PR identified) on GitHub
- ✓ PR has a structured description with Summary, Changes, and Notes sections
- ✓ PR URL displayed for easy access

## Security Notes
- **Authentication**: The `gh` CLI must be authenticated. Run `gh auth status` to verify before starting.
- **Sensitive files**: Review staged changes before committing. Avoid committing files containing secrets (`.env`, credentials, API keys). The agent should warn if it detects potentially sensitive files.
- **Force push**: This skill never uses `--force`. It only performs safe, non-destructive git operations.
- **Branch protection**: If the default branch has protection rules, the PR will respect them. Direct pushes to the default branch are avoided.

## Troubleshooting

### `gh` CLI not authenticated
- Run `gh auth login` and follow the prompts
- Verify with `gh auth status`

### No GitHub remote configured
- Ensure the repository has a GitHub remote: `git remote -v`
- Add one if missing: `git remote add origin https://github.com/<OWNER>/<REPO>.git`

### Branch already exists on remote
- If `git push` fails because the remote branch exists with different history, investigate manually
- This skill does not force-push; resolve conflicts before retrying

### PR creation fails due to branch protection
- Ensure your GitHub token has sufficient permissions
- Check repository settings for branch protection rules

### Empty diff against default branch
- If the branch has already been merged or is up to date, there are no changes to PR
- Verify with `git log main..HEAD` that there are commits to include

## References
- GitHub CLI Documentation: https://cli.github.com/manual/
- Git Documentation: https://git-scm.com/doc
- Conventional Commits: https://www.conventionalcommits.org/
