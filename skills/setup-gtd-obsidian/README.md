# Setup GTD Obsidian

Ask for the Obsidian vault checkout path, store it in local config, align to numbered GTD filenames, and verify git sync.

## Overview

- Prompts for the vault path (folder with `.obsidian/` / `gtd/`)
- Writes `~/.config/gtd-obsidian/config.toml`
- Creates `gtd/` and `gtd-archives/` when missing (after user confirm)
- Bootstraps missing numbered lists only (never overwrites existing notes)
- Verifies `git pull` and pushes bootstrap commits when needed

## Prerequisites

- Git-managed vault checkout
- Write access to vault and `~/.config/`
- Remote credentials for pull/push

## Usage

```
@setup-gtd-obsidian
@setup-gtd-obsidian /home/you/code/zdoc/git-obsidian
@setup-gtd-obsidian show
@setup-gtd-obsidian reset
```

## What Gets Configured

| Component | Detail |
|-----------|--------|
| `config.toml` | `vault_root`, `gtd_folder`, `archives_folder`, `git_sync` |
| Folders | Creates `gtd/` + `gtd-archives/` if absent |
| Lists | `5-gtd-inbox`, `3-gtd-actions`, `4-gtd-projects`, `2-gtd-tickler`, `6-gtd-someday`, archives |
| Git | Pull check + optional bootstrap push |

## Security Considerations

- ⚠️ Machine-local config only — do not commit `~/.config/gtd-obsidian/`
- ⚠️ Setup may push to the vault remote

## Expected Results

- ✅ Config points at absolute vault path
- ✅ `gtd/` created when it did not exist
- ✅ Numbered GTD files present
- ✅ Git sync path verified

## Troubleshooting

### Vault is a subfolder of a monorepo
Set `vault_root` to the vault subfolder (e.g. `…/git-obsidian`), not only the git toplevel.

## License

See [LICENSE](./LICENSE).
