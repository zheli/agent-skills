---
name: markdown-task-tracking
description: Track project tasks and epics in individual markdown files under docs/, with docs/PROJECT.md as the central index. Supports bootstrapping new projects and managing ongoing work.
allowed-tools: [Bash, Read, Write, Edit, Glob, Grep]
---

# Markdown Task Tracking

## Purpose

Track project tasks and epics using individual markdown files. Each task or epic
gets its own file under `docs/`, while `docs/PROJECT.md` serves as the central
index with a status table. This keeps tracking scalable — multiple workstreams
can be tracked simultaneously without a single file becoming unwieldy.

## Prerequisites

- A Git repository
- Write access to the repository

If `docs/PROJECT.md` does not exist yet, bootstrap it first (see Step 1).

## When to Use This Skill

Use this skill when you need to:
- Start tracking tasks and progress in a new or existing project
- Create a new task or epic during a session
- Update the status of an existing task or epic
- Review current project status at the start of a session
- Ensure all work is tracked before ending a session

## Conventions

### File naming

Each task or epic lives in its own file under `docs/`:

```
docs/{ID}-{TYPE}-{kebab-case-title}.md
```

- **`{ID}`**: Zero-padded 3-digit number (e.g. `001`, `002`, `013`)
- **`{TYPE}`**: Either `EPIC` (multi-step, multi-session effort) or `TASK` (single deliverable)
- **`{title}`**: Kebab-case descriptive title

Examples:
- `docs/001-EPIC-devnet-validator-deployment.md`
- `docs/002-TASK-github-action-redeployment.md`
- `docs/015-TASK-fix-login-redirect-bug.md`

### Status values

Use these status values consistently in both the index table and individual files:
- **⏳ Not started** — work has not begun
- **🚧 In progress** — actively being worked on
- **✅ Complete** — finished and verified

### Index table format

The `docs/PROJECT.md` file contains a table with this structure:

```markdown
| ID | Type | Title | Status | File |
|----|------|-------|--------|------|
| 001 | Epic | Example Epic | **🚧 In progress** | [001-EPIC-example-epic.md](001-EPIC-example-epic.md) |
| 002 | Task | Example Task | ⏳ Not started | [002-TASK-example-task.md](002-TASK-example-task.md) |
```

Bold the status when it is **🚧 In progress** or **✅ Complete** to make active/done
items stand out.

## Steps

### 1. Bootstrap (if `docs/PROJECT.md` does not exist)

If the repository does not yet have a `docs/PROJECT.md`, create the directory
and index file:

```bash
mkdir -p docs
```

Create `docs/PROJECT.md` with this structure:

```markdown
# <Project Name> — Project Tracking

This file is the main index for the project. It contains project context and a
table of all tracked epics and tasks. Read this file at the start of a session.

For detailed progress, notes, and history, see the individual epic/task files
linked in the table below.

## Context

| Key | Value |
|-----|-------|
| Repository | `<repo URL>` |

## Current Status

<brief summary of where things stand>

## Tasks & Epics

| ID | Type | Title | Status | File |
|----|------|-------|--------|------|

## How to Add a New Task or Epic

1. Find the next available ID by checking the table above.
2. Create a new file: `docs/{ID}-{EPIC|TASK}-{kebab-case-title}.md`
3. Use the epic/task file template.
4. Add a row to the **Tasks & Epics** table above.
```

Fill in the Context table with relevant project details (repository URL,
environment, key config values, etc.).

### 2. Review current status (at session start)

```bash
cat docs/PROJECT.md
```

Read the index table to understand what epics/tasks exist and their current
status. If you need detail on a specific item, read its individual file.

### 3. Create a new task or epic

When a new task or epic is identified (by the user or discovered during work):

**a) Determine the next ID:**

```bash
# Look at the highest existing ID in the docs/ directory
ls docs/[0-9]*-{EPIC,TASK}-*.md 2>/dev/null | sort -t/ -k2 | tail -1
```

Increment by 1 and zero-pad to 3 digits.

**b) Create the file using the template:**

```markdown
# {ID} — {Title}

**Type:** Epic | Task
**Status:** ⏳ Not started
**Created:** YYYY-MM-DD
**Updated:** YYYY-MM-DD

## Goal

<1-2 sentence description of what this task/epic aims to accomplish>

## Progress

- [ ] Step 1
- [ ] Step 2

## Notes

<discoveries, known issues, context>

## Next Steps

<what remains to be done>
```

**c) Add a row to the index table in `docs/PROJECT.md`:**

```markdown
| {ID} | {Type} | {Title} | ⏳ Not started | [{filename}]({filename}) |
```

### 4. Start work on a task or epic

When beginning work on an item:

1. Open `docs/{ID}-{TYPE}-{title}.md`
2. Change `**Status:**` from `⏳ Not started` to `🚧 In progress`
3. Update the `**Updated:**` date
4. Update the matching row in `docs/PROJECT.md` to `**🚧 In progress**`

### 5. Record progress

As you work, update the task/epic file:

- Check off completed steps: `- [ ]` to `- [x]`
- Add new steps as they are discovered
- Add notes in the Notes section (discoveries, blockers, decisions)
- Update the `**Updated:**` date

### 6. Complete a task or epic

When work is finished:

1. Open `docs/{ID}-{TYPE}-{title}.md`
2. Change `**Status:**` to `✅ Complete`
3. Update the `**Updated:**` date
4. Check off all remaining steps
5. Update the matching row in `docs/PROJECT.md` to `**✅ Complete**`

### 7. Commit and push

All changes to tracking files must be committed and pushed to the remote
repository. Do not leave uncommitted tracking updates at the end of a session.

```bash
git add docs/PROJECT.md docs/{ID}-{TYPE}-*.md
git commit -m "docs: <describe tracking update>"
git push
```

## Key Rules

1. **One file per task/epic** — never lump multiple items into one file.
2. **Keep PROJECT.md lean** — only context + index table. All detail lives in
   individual files.
3. **Be proactive** — create tracking files for new tasks/epics as they arise
   during a session. Do not wait to be asked.
4. **Always sync both files** — when updating status, update both the individual
   file and the `docs/PROJECT.md` index table.
5. **Always commit and push** — all changes must be committed and pushed before
   the session ends. Do not leave uncommitted work.

## Expected Results

After using this skill, you should have:
- A `docs/PROJECT.md` index file with a table of all tracked items
- Individual `docs/{ID}-{TYPE}-{title}.md` files for each task/epic
- Status kept in sync between the index and individual files
- All tracking changes committed and pushed

## Troubleshooting

### No `docs/` directory exists
Run the bootstrap step (Step 1) to create it.

### ID conflict
Always check the existing files before assigning an ID. Use `ls docs/[0-9]*` to
see all existing IDs and pick the next one.

### Status out of sync
If the index table and individual file disagree on status, the individual file is
the source of truth. Update the index to match.

### Large number of tasks
If the index table grows very long, consider adding section headers to group
related items (e.g. by epic or by area).
