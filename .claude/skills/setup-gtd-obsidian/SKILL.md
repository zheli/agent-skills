---
name: setup-gtd-obsidian
description: >-
  First-time setup for GTD Obsidian workflows. Asks for the checked-out
  Obsidian vault git path, validates numbered gtd/* files, stores vault_root /
  gtd_folder / archives_folder in ~/.config/gtd-obsidian/config.toml, bootstraps
  missing lists, and verifies git pull/push sync. Use when initializing GTD
  Obsidian, changing the vault path, or when gtd-obsidian reports missing config.
allowed-tools: [Bash, Read, Write, Edit, Glob, Grep]
argument-hint: "[vault path] | show | reset"
disable-model-invocation: true
---

# Setup GTD Obsidian

## Purpose

Configure this computer so `gtd-obsidian` knows which Obsidian vault checkout to
use, matches the vault's numbered GTD filenames, and can **git sync** (pull /
commit / push) notes.

**Announce at start:** "Setting up GTD Obsidian…"

## Prerequisites

- A git checkout that contains the Obsidian vault (vault may be the repo root or
  a subfolder such as `git-obsidian/`)
- Write access to the vault and to `$HOME/.config/`
- Ability to `git pull` and `git push` on that repo

## When to Use This Skill

- First time using GTD Obsidian on this machine
- Vault moved or recloned
- `gtd-obsidian` says config is missing
- Show or reset the stored vault path

## Local config (machine setting)

| Item | Value |
|---|---|
| Directory | `${XDG_CONFIG_HOME:-$HOME/.config}/gtd-obsidian/` |
| File | `config.toml` |

```toml
# Local GTD Obsidian settings (this machine only — do not commit)
vault_root = "/absolute/path/to/obsidian-vault"
gtd_folder = "gtd"
archives_folder = "gtd-archives"
git_sync = true
```

- `vault_root` (required): absolute path to the folder that contains `gtd/` and
  usually `.obsidian/`
- `gtd_folder` (optional): default `gtd`
- `archives_folder` (optional): default `gtd-archives`
- `git_sync` (optional): default `true` — `gtd-obsidian` always pull/push when true

Never commit this file into agent-skills.

## Detect mode

| Arguments | Mode |
|---|---|
| empty or a path | **Setup** |
| `show` | Print config and stop |
| `reset` | Delete config after confirm, offer Setup |

### Show

```bash
CONFIG_FILE="${XDG_CONFIG_HOME:-$HOME/.config}/gtd-obsidian/config.toml"
[ -f "$CONFIG_FILE" ] && cat "$CONFIG_FILE" || echo "No config — run setup."
```

### Reset

Confirm, then remove `config.toml` (and empty config dir). Offer Setup again.

---

## Setup mode

### Step 1: Ask for the vault checkout path

If `$ARGUMENTS` is a path, use it. Otherwise ask:

> Where is the checked-out Obsidian vault on this computer?
> Give the absolute path to the vault folder (the one with `.obsidian/` and/or `gtd/`).
> Example: `/home/you/code/zdoc/git-obsidian`

Expand `~`. Reject empty input.

### Step 2: Validate

```bash
VAULT_ROOT="$(realpath -e "<candidate>")"
git -C "$VAULT_ROOT" rev-parse --is-inside-work-tree
GIT_TOPLEVEL="$(git -C "$VAULT_ROOT" rev-parse --show-toplevel)"
```

Checks:

1. Directory exists and is writable
2. Inside a git work tree
3. Prefer `test -d "$VAULT_ROOT/.obsidian"` — if missing, ask whether a
   subdirectory is the real vault
4. Detect existing GTD layout:

```bash
ls -1 "$VAULT_ROOT/gtd" 2>/dev/null
ls -1 "$VAULT_ROOT/gtd-archives" 2>/dev/null
```

If numbered files like `5-gtd-inbox.md` / `3-gtd-actions.md` exist, adopt that
layout (do not rename).

**If `gtd/` (or the chosen `<GTD_FOLDER>`) is missing:** tell the user clearly
and offer to create it:

> No `gtd/` folder found in this vault. Create a new GTD folder with starter
> lists (`5-gtd-inbox.md`, `3-gtd-actions.md`, …) and `gtd-archives/`?

- If the user says **yes** → set `CREATE_GTD=true` and continue (Step 5 creates
  the folder + files).
- If the user says **no** → ask for a different vault path or an existing GTD
  folder name, then re-validate. Do not write config pointing at a vault with
  no GTD location unless they explicitly want a custom folder name that you
  will create.

Print confirmation:

```
Vault root: …
Git toplevel: …
Obsidian: yes|no
GTD folder: present (files: …) | missing — will create on confirm
Archives: present | missing — will create on confirm
```

Ask user to confirm before writing config (and before creating folders).

### Step 3: Folder names

Defaults: `gtd_folder=gtd`, `archives_folder=gtd-archives`. Ask only if the
user's folders differ. If they choose a custom name and it does not exist,
treat it the same as a missing `gtd/` — offer to create that folder.

### Step 4: Write config

```bash
CONFIG_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/gtd-obsidian"
mkdir -p "$CONFIG_DIR"
```

Write absolute `vault_root` (no `~`):

```toml
# Local GTD Obsidian settings (this machine only — do not commit)
vault_root = "<VAULT_ROOT>"
gtd_folder = "gtd"
archives_folder = "gtd-archives"
git_sync = true
```

### Step 5: Create GTD folder and bootstrap missing files

**Create the folder when absent** (this is expected for new vaults):

```bash
mkdir -p "$VAULT_ROOT/$GTD_FOLDER" "$VAULT_ROOT/$ARCHIVES_FOLDER"
```

Announce what was created, for example:

```
Created: <VAULT_ROOT>/gtd/
Created: <VAULT_ROOT>/gtd-archives/
```

Then create any **missing** starter files below. **Never overwrite** non-empty
existing files.

| Path | Starter |
|---|---|
| `$GTD_FOLDER/5-gtd-inbox.md` | `# Inbox\n` |
| `$GTD_FOLDER/3-gtd-actions.md` | `# Actions\n\n` |
| `$GTD_FOLDER/4-gtd-projects.md` | `# Projects\n\n` |
| `$GTD_FOLDER/2-gtd-tickler.md` | `# Tickler\n\n` |
| `$GTD_FOLDER/6-gtd-someday.md` | `# Someday\n` |
| `$ARCHIVES_FOLDER/archives.md` | `# Archives\n\n` |
| `$GTD_FOLDER/8-gtd-rules-read-this.md` | Only if missing — minimal capture/processing reminders (contexts `@computer`, `@read`, `@private`; inbox = plain bullets; actions need `#gtd #next`) |
| `$GTD_FOLDER/0-default-main-page.md` | Only if missing — optional dashboard stub |

Example create (skip each path that already exists):

```bash
# Create folders (no-op if they already exist)
mkdir -p "$VAULT_ROOT/$GTD_FOLDER" "$VAULT_ROOT/$ARCHIVES_FOLDER"

# Create starter files only when missing
for f in 5-gtd-inbox.md 3-gtd-actions.md 4-gtd-projects.md 2-gtd-tickler.md 6-gtd-someday.md; do
  path="$VAULT_ROOT/$GTD_FOLDER/$f"
  if [ ! -e "$path" ]; then
    case "$f" in
      5-gtd-inbox.md) printf '%s\n' '# Inbox' > "$path" ;;
      3-gtd-actions.md) printf '%s\n\n' '# Actions' > "$path" ;;
      4-gtd-projects.md) printf '%s\n\n' '# Projects' > "$path" ;;
      2-gtd-tickler.md) printf '%s\n\n' '# Tickler' > "$path" ;;
      6-gtd-someday.md) printf '%s\n' '# Someday' > "$path" ;;
    esac
    echo "Created $path"
  fi
done
if [ ! -e "$VAULT_ROOT/$ARCHIVES_FOLDER/archives.md" ]; then
  printf '%s\n\n' '# Archives' > "$VAULT_ROOT/$ARCHIVES_FOLDER/archives.md"
  echo "Created $VAULT_ROOT/$ARCHIVES_FOLDER/archives.md"
fi
```

If `$GTD_FOLDER/8-gtd-rules-read-this.md` is missing, write a short rules file
covering: inbox = unprocessed plain bullets only; actions require
`#gtd #next` plus `@computer` or `@read`; optional `@private`; move done items
to `gtd-archives/archives.md`.

Do **not** create legacy names (`inbox.md`, `next-actions.md`, `completed.md`).

### Step 6: Verify git sync

```bash
git -C "$VAULT_ROOT" status -sb
git -C "$VAULT_ROOT" remote -v
git -C "$VAULT_ROOT" pull --no-rebase --autostash
```

If new files were created:

```bash
cd "$GIT_TOPLEVEL"
REL_VAULT="${VAULT_ROOT#$GIT_TOPLEVEL/}"
git add -- "$REL_VAULT/gtd" "$REL_VAULT/gtd-archives"
git commit -m "$(cat <<'EOF'
gtd: bootstrap list files

EOF
)"
git push
```

Skip commit when nothing to stage. Report push success or errors.

### Step 7: Finish

```
Setup complete.
Config: ~/.config/gtd-obsidian/config.toml
Vault: <VAULT_ROOT>
Git toplevel: <GIT_TOPLEVEL>
Git sync: pull → commit → push enabled
Use gtd-obsidian: capture | review | done | next
```

## Expected Results

- ✅ Local `config.toml` with absolute `vault_root`
- ✅ `gtd/` (or chosen folder) created when it was missing
- ✅ Numbered GTD starter files present under the GTD folder
- ✅ `gtd-archives/archives.md` present
- ✅ `git pull` works; bootstrap commits are pushed when applicable

## Security Notes

- ⚠️ Config is machine-local under `~/.config/`
- ⚠️ Records a path to personal notes
- ⚠️ Setup may `git push` bootstrap commits — confirm remote is correct

## Troubleshooting

### Path is repo root but vault is a subfolder
Point `vault_root` at the subfolder that contains `.obsidian/` / `gtd/`
(e.g. `…/zdoc/git-obsidian`), not necessarily the git toplevel.

### Pull/push fails
Fix auth/remote tracking, then re-run setup Step 6.

### Layout already exists
Setup must not rename or flatten numbered files.

### No gtd folder in vault
Offer to create `gtd/` and `gtd-archives/` with starter list files. Do not
abort setup solely because the folder is missing — creating it is part of setup.

## References

- Companion: `gtd-obsidian`
- [XDG Base Directory](https://specifications.freedesktop.org/basedir-spec/basedir-spec-latest.html)
