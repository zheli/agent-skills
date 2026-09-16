# GTD Obsidian Vault

Operate Getting Things Done on numbered markdown lists in a git-managed Obsidian vault, with automatic git pull/commit/push sync.

## Overview

- Uses the vault layout: `gtd/5-gtd-inbox.md`, `3-gtd-actions.md`, `4-gtd-projects.md`, `2-gtd-tickler.md`, `6-gtd-someday.md`, `gtd-archives/archives.md`
- Commands: **capture**, **review**, **mark as done**, **what's next**
- Inbox captures are plain bullets (no checkboxes); actions use `#gtd #next @context`
- Every mutating command: `git pull` → edit → `git commit` → `git push`

## Prerequisites

- Run **`setup-gtd-obsidian`** first (`~/.config/gtd-obsidian/config.toml`)
- Git remote access for pull/push on the vault repo

## Usage

1. `@setup-gtd-obsidian` with the vault path (example: `/home/you/code/zdoc/git-obsidian`)
2. `@gtd-obsidian` with `capture|review|done|next …`
3. Vault path always comes from local config

## What Gets Configured

| Component | Detail |
|-----------|--------|
| Local config | `vault_root`, `gtd_folder`, `archives_folder`, `git_sync` |
| Lists | Numbered `gtd/*-gtd-*.md` + `gtd-archives/archives.md` |
| Sync | Pull before edits; commit + push after |

## Security Considerations

- ⚠️ Personal vault data — only touch `gtd/` and `gtd-archives/` unless asked
- ⚠️ No secrets in GTD markdown
- ⚠️ Push updates the remote

## Expected Results

- ✅ Captures append plain bullets to `5-gtd-inbox.md`
- ✅ Done items prepend to `gtd-archives/archives.md`
- ✅ Mutating commands leave the remote updated

## Troubleshooting

### Config missing
Run `@setup-gtd-obsidian`.

### Conflicts on pull/push
Resolve GTD file conflicts, keep unique bullets, re-run review if needed.

## Technical Details

- **Config:** `~/.config/gtd-obsidian/config.toml`
- **Setup skill:** `setup-gtd-obsidian`
- **Tags:** `#gtd` `#next` `@computer` `@read` `@private`
- **Due dates:** `📅 YYYY-MM-DD` (Obsidian Tasks)

## License

See [LICENSE](./LICENSE).
