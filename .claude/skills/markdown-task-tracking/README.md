# Markdown Task Tracking

A Claude skill for tracking project tasks and epics using individual markdown files under `docs/`, with `docs/PROJECT.md` as the central index.

## Overview

This skill provides a lightweight, file-based project tracking system by:
- Using `docs/PROJECT.md` as a central index with a status table
- Creating individual markdown files for each task or epic
- Following a consistent naming convention: `docs/{ID}-{TYPE}-{title}.md`
- Keeping status in sync between the index and individual files
- Supporting bootstrapping for new projects and ongoing management

## Use Cases

- Starting task tracking in a new project that doesn't have a formal issue tracker
- Tracking multi-session epics alongside quick single-session tasks
- Maintaining project context across multiple coding sessions
- Giving agents a structured way to discover and resume in-progress work

## Prerequisites

Before using this skill, ensure you have:
- A Git repository with write access
- No existing conflicting `docs/PROJECT.md` (or willingness to adopt this format)

## Usage

1. Invoke the skill when you need to track project work
2. If `docs/PROJECT.md` doesn't exist, the skill bootstraps the directory and index file
3. To create a new task or epic:
   - Determine the next available ID
   - Create `docs/{ID}-{EPIC|TASK}-{kebab-case-title}.md` using the template
   - Add a row to the index table in `docs/PROJECT.md`
4. Update status in both the individual file and the index table as work progresses
5. Commit and push all tracking changes before ending a session

## What Gets Configured

| Component | Configuration |
|-----------|---------------|
| Directory | `docs/` created if it doesn't exist |
| Index file | `docs/PROJECT.md` with context and status table |
| Task files | Individual `docs/{ID}-{TYPE}-{title}.md` files |
| Naming | Zero-padded 3-digit IDs with EPIC or TASK type prefix |
| Status values | Not started, In progress, Complete |

## Security Considerations

- ⚠️ **No sensitive data**: Do not store credentials, API keys, or secrets in tracking files. These files are committed to the repository.
- ⚠️ **Repository visibility**: Task files are plain markdown committed to Git. Ensure the repository's visibility settings are appropriate for the content being tracked.

## Expected Results

After successful execution:
- ✅ `docs/PROJECT.md` exists with a context section and status table
- ✅ Each task or epic has its own file under `docs/`
- ✅ Status is consistent between the index table and individual files
- ✅ All tracking changes are committed and pushed to the remote

## Troubleshooting

### No `docs/` directory exists
Run the bootstrap step to create `docs/` and `docs/PROJECT.md`.

### ID conflict
Always check existing files before assigning an ID. Use `ls docs/[0-9]*` to see all existing IDs and pick the next available number.

### Status out of sync
If the index table and individual file disagree on status, the individual file is the source of truth. Update the index to match.

### Large number of tasks
If the index table grows very long, consider adding section headers to group related items by epic or area.

## Technical Details

- **Required tools**: `git`, file read/write access
- **File format**: Markdown with YAML-like metadata fields
- **Naming convention**: `{ID}-{TYPE}-{kebab-case-title}.md` (e.g., `001-EPIC-setup-infrastructure.md`)
- **Status values**: Not started, In progress, Complete
- **Index file**: `docs/PROJECT.md`

## License

See [LICENSE](./LICENSE) file for details.
