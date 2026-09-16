---
name: gtd-obsidian
description: >-
  Run Getting Things Done (GTD) workflows on numbered markdown lists in a
  git-managed Obsidian vault (gtd/5-gtd-inbox.md, 3-gtd-actions.md, etc.).
  Automatically git pull/commit/push to sync notes. Use when the user asks to
  capture, review, mark done, mark as done, what's next, next action, process
  inbox, or manage GTD notes in Obsidian.
allowed-tools: [Bash, Read, Write, Edit, Glob, Grep]
argument-hint: capture|review|done|next [text or item]
---

# GTD Obsidian Vault

## Purpose

Operate the vault's existing GTD system under `gtd/` (and archives under
`gtd-archives/`). Support **capture**, **review**, **mark as done**, and
**what's next action?** Always **sync with git** (pull → change → commit → push)
after mutating commands.

**Announce at start** the command and resolved `<VAULT_ROOT>`.

## Prerequisites

- Local config from `setup-gtd-obsidian` (see **Resolve vault settings**)
- Write access to the vault and permission to `git pull` / `git push`
- Familiarity with vault rules in `gtd/8-gtd-rules-read-this.md` (read it when
  reviewing if unsure)

If config is missing, stop and run **`setup-gtd-obsidian`** first.

## When to Use This Skill

- Capture a thought into the inbox
- Process / review the inbox
- Mark a next action complete and archive it
- Ask what the next action should be right now

## Customization Variables

| Variable | Description | Source |
|---|---|---|
| `<VAULT_ROOT>` | Absolute path to the Obsidian vault (contains `.obsidian/` and `gtd/`) | Local config |
| `<GTD_FOLDER>` | GTD lists folder | Config, default `gtd` |
| `<ARCHIVES_FOLDER>` | Completed-item archive folder | Config, default `gtd-archives` |
| `<CONFIG_FILE>` | Machine-local settings | `~/.config/gtd-obsidian/config.toml` |
| `<GIT_TOPLEVEL>` | `git rev-parse --show-toplevel` from `<VAULT_ROOT>` | Derived |

## Resolve vault settings

```bash
CONFIG_FILE="${XDG_CONFIG_HOME:-$HOME/.config}/gtd-obsidian/config.toml"
```

1. If config is missing → stop; run **`setup-gtd-obsidian`**.
2. Read:
   - `vault_root` (required) → `<VAULT_ROOT>`
   - `gtd_folder` (optional, default `gtd`)
   - `archives_folder` (optional, default `gtd-archives`)
3. Verify path and git:

```bash
realpath -e "$VAULT_ROOT"
test -d "$VAULT_ROOT/.obsidian" || test -d "$VAULT_ROOT/$GTD_FOLDER"
git -C "$VAULT_ROOT" rev-parse --is-inside-work-tree
GIT_TOPLEVEL="$(git -C "$VAULT_ROOT" rev-parse --show-toplevel)"
```

4. If broken → re-run **`setup-gtd-obsidian`**.
5. Do not invent a vault path from the current workspace when config is missing.

## File layout (authoritative)

Paths relative to `<VAULT_ROOT>`:

```
gtd/
  0-default-main-page.md    # Dashboard / Tasks queries (do not edit unless asked)
  2-gtd-tickler.md          # Date-specific / scheduled
  3-gtd-actions.md          # Clarified next actions (execution list)
  4-gtd-projects.md         # Multi-step projects
  5-gtd-inbox.md            # Unprocessed captures ONLY
  6-gtd-someday.md          # Incubate
  8-gtd-rules-read-this.md  # Processing rules (read during review)
gtd-archives/
  archives.md               # Done log (newest entries prepended)
```

Do **not** invent `inbox.md`, `next-actions.md`, `waiting-for.md`, or
`completed.md`. Use the numbered filenames above.

Before editing, if `gtd/8-gtd-rules-read-this.md` exists, treat it as the
source of truth for contexts and processing order.

## Item formats (match the vault)

### Inbox — `gtd/5-gtd-inbox.md`

Raw captures. **Plain bullets, no checkboxes, no `#gtd` tags:**

```markdown
# Inbox
- ask jatin about infra grant
- read Simon's reply
```

### Next actions — `gtd/3-gtd-actions.md`

```markdown
# Actions

- [ ] Verb-first next action. #gtd #next @computer
- [ ] Personal errand. #gtd #next @computer @private
- [x] Finished action. #gtd #next @computer ✅ 2026-09-15
```

Required on open actions: `#gtd` and `#next`, plus a context (`@computer` or
`@read`). Add `@private` for non-work. Optional due date: `📅 YYYY-MM-DD`
(Obsidian Tasks).

### Projects — `gtd/4-gtd-projects.md`

```markdown
## Project Name
#project

**Outcome:** <done looks like what>

**NEXT:** [ ] Clear next physical action. #gtd #next @computer

**Actions:**
- [ ] Supporting checklist item. @computer
- [x] Done supporting item. @computer ✅ 2026-09-10
```

Keep exactly one clear **`NEXT:`** line per active project.

### Tickler — `gtd/2-gtd-tickler.md`

```markdown
# Tickler

- [ ] Deadline: buy ticket. https://example.com 📅 2026-09-12
- 2026-10-28 — Event day 1, place.
```

### Someday — `gtd/6-gtd-someday.md`

```markdown
# Someday
- [ ] Deferred idea. #gtd @computer
```

### Archives — `gtd-archives/archives.md`

```markdown
- [x] Completed action text #gtd #next @computer ✅ 2026-09-10
```

### Contexts (from vault rules)

| Tag | Meaning |
|---|---|
| `@computer` | Active interactive work (produce output) |
| `@read` | Consumption only |
| `@private` | Domain: personal / non-work (combine with a context) |

## Detect command

| Intent | Triggers | Section |
|---|---|---|
| Capture | `capture`, `inbox`, "remember to" | **Capture** |
| Review | `review`, "process inbox", "weekly review" | **Review** |
| Mark done | `done`, "mark as done", `complete` | **Mark as Done** |
| Next | `next`, "what's next", "next action" | **What's Next** |

---

## Git sync (required)

The vault is git-managed (often a subfolder of a larger repo, e.g. `zdoc`).
Obsidian may also auto-backup via obsidian-git — still sync explicitly from this
skill so agent edits are not left unpushed.

### Before every mutating command

```bash
git -C "$VAULT_ROOT" status -sb
git -C "$VAULT_ROOT" pull --no-rebase --autostash
```

If pull fails due to conflicts, stop, report the conflicted files, and do not
overwrite user/remote changes.

### After every mutating command

Stage only GTD-related paths (vault-relative from `<GIT_TOPLEVEL>`):

```bash
cd "$GIT_TOPLEVEL"
# Example paths when vault is git-obsidian/ under zdoc:
#   git-obsidian/gtd/*.md
#   git-obsidian/gtd-archives/archives.md
REL_VAULT="${VAULT_ROOT#$GIT_TOPLEVEL/}"
git add -- "$REL_VAULT/$GTD_FOLDER" "$REL_VAULT/$ARCHIVES_FOLDER"
git status
git commit -m "$(cat <<'EOF'
<commit message>

EOF
)"
git push
```

If `git add` stages nothing, skip commit/push and say so.

**Commit message style** (match vault history):

| Command | Example |
|---|---|
| Capture | `Capture: <short summary>` |
| Review / clarify | `Clarify <item>` or `gtd: review inbox` |
| Mark done / remove | `Remove completed <item>` or `Archive completed GTD actions` |
| Bootstrap | `gtd: bootstrap list files` |

**Rules:**

- Always pull before edit; always push after successful commit.
- Never `--force` push.
- Never amend unless the user explicitly asks and amend safety rules pass.
- Do not commit unrelated vault files (notes outside `gtd/` / `gtd-archives/`)
  unless the user asks.

Read-only **What's Next** does not commit; still `git pull` first so
recommendations are current.

---

## Capture

1. **Git pull** (see Git sync).
2. Read `gtd/5-gtd-inbox.md`.
3. Append each capture as a **plain** `- ` bullet (no `[ ]`, no `#gtd`).
4. Confirm the new line(s).
5. **Commit + push** with `Capture: <short summary>`.

Do not clarify during capture. Do not write to `3-gtd-actions.md` unless the
user explicitly says "capture as next action".

---

## Review

Default: process inbox. "Weekly review" also scans actions, projects, tickler,
and someday.

1. **Git pull**.
2. Read `gtd/8-gtd-rules-read-this.md` and `gtd/5-gtd-inbox.md`.
3. For each inbox bullet, clarify and **move** (delete from inbox):

| Decision | Destination |
|---|---|
| Trash | Delete |
| Next action | `3-gtd-actions.md` as `- [ ] … #gtd #next @context` |
| Multi-step | Ensure `## Project` in `4-gtd-projects.md` with **Outcome** + **NEXT:**; remove from inbox |
| Date-specific | `2-gtd-tickler.md` (checkbox + `📅` and/or dated line) |
| Someday | `6-gtd-someday.md` |
| Reference | Suitable note under vault (ask path if unclear); remove from inbox |
| Already done | Prepend to `gtd-archives/archives.md` as `- [x] … ✅ YYYY-MM-DD` |

4. Every active project must have a **NEXT:** action. Draft one if missing and
   confirm with the user when ambiguous.
5. Leave inbox with only `# Inbox` heading (no leftover bullets), or only items
   the user deferred mid-review.
6. Summarize moves; **commit + push**.

---

## Mark as Done

1. **Git pull**.
2. Find the item (substring / context) in order:
   `3-gtd-actions.md` → `4-gtd-projects.md` → `2-gtd-tickler.md` →
   `6-gtd-someday.md` → `5-gtd-inbox.md`
3. If multiple matches, ask which one.
4. Remove the line from the source (and clear/update project **NEXT:** if that
   was the next action; ask for a replacement next action when the project
   continues).
5. Prepend to `gtd-archives/archives.md`:

```markdown
- [x] <original text without leading - [ ]> ✅ YYYY-MM-DD
```

   Preserve `#gtd` / `#next` / `@context` when present. If the source was a
   plain inbox bullet, archive as `- [x] <text> ✅ YYYY-MM-DD`.
6. Confirm; **commit + push** (`Archive completed GTD actions` or
   `Remove completed <short summary>`).

---

## What's Next Action?

1. **Git pull** (no commit).
2. Collect unchecked `- [ ]` lines from `3-gtd-actions.md` and **NEXT:** lines
   from `4-gtd-projects.md`.
3. Filter by user `@context` / `@private` / time if given.
4. Prefer concrete `#gtd #next` actions; call out tickler items due today from
   `2-gtd-tickler.md` (`📅` on or before today) as urgent.
5. Present:
   - **Do now:** one item (quote + file)
   - **Also available:** up to 3 alternatives
   - **Inbox debt:** count of bullets in `5-gtd-inbox.md` (suggest review if > 0)
6. Do not mark done unless asked.

If no next actions: recommend **Review** when inbox is non-empty; otherwise
report decks clear / projects missing NEXT.

---

## Bootstrap (only if lists missing)

If `setup-gtd-obsidian` did not create files and a required list is absent,
create the missing numbered files with headings only (`# Inbox`, `# Actions`,
etc.). Never overwrite non-empty existing files. Never replace
`8-gtd-rules-read-this.md` if present.

Then git commit + push.

## Expected Results

- ✅ Edits use numbered `gtd/*-gtd-*.md` paths and vault tag conventions
- ✅ Captures are plain inbox bullets
- ✅ Done items land in `gtd-archives/archives.md`
- ✅ Mutating commands: pull → edit → commit → push
- ✅ What's next uses current remote state after pull

## Security Notes

- ⚠️ Vault notes are personal. Only touch `gtd/` and `gtd-archives/` unless asked.
- ⚠️ Do not capture secrets into markdown.
- ⚠️ `git push` updates the remote clone — ensure the correct remote/branch.

## Troubleshooting

### Config missing
Run `setup-gtd-obsidian`.

### Pull/push conflicts
Resolve conflicted GTD files with the user; prefer keeping both unique bullets,
then re-review.

### Wrong filenames
If the vault still uses this layout, never fall back to `inbox.md` /
`next-actions.md`.

### Inbox has checkboxes
Prefer converting to plain bullets on capture/review to match
`5-gtd-inbox.md` convention (Tasks queries treat inbox as untagged).

## References

- Vault rules: `gtd/8-gtd-rules-read-this.md`
- Companion: `setup-gtd-obsidian`
- [Getting Things Done](https://gettingthingsdone.com/what-is-gtd/)
- [Obsidian Tasks](https://publish.obsidian.md/tasks/)
