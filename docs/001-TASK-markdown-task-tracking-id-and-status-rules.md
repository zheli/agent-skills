# 001 — Markdown Task Tracking ID and Status Rules

**Type:** Task
**Status:** 🚧 In progress
**Created:** 2026-05-06
**Updated:** 2026-05-06

## Goal

Improve the markdown task tracking skill so agents consistently include status
emoji in `docs/PROJECT.md` and avoid ID conflicts with open GitHub PRs.

## Progress

- [x] Bootstrap `docs/PROJECT.md` task tracking for this repository
- [x] Create a task file for the improvement
- [x] Require emoji-prefixed status values in `docs/PROJECT.md`
- [x] Document checking open GitHub PRs before assigning task IDs
- [ ] Open a pull request for review

## Notes

Open GitHub PRs were checked with `gh pr list --state open --json number,title,headRefName`; no open PRs were present when assigning ID `001`.

## Next Steps

Commit the documentation updates, push the feature branch, and create the pull
request.
