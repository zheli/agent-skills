---
name: create-ticket
description: Create a new Linear ticket using the linear CLI
disable-model-invocation: true
argument-hint: <title or "init" for first-time setup>
---

# Create Linear Ticket

Create a new Linear ticket using the `linear` CLI (schpet/linear-cli).

Supports two modes:
- **Init mode** (`/create-ticket init`): guides first-time setup of the linear CLI
- **Create mode** (`/create-ticket <title>`): creates a ticket from a quick description

**Announce at start:** "Creating a new Linear ticket..."

---

## Customization Variables

| Variable | Description | Example |
|---|---|---|
| `<WORKSPACE_SLUG>` | Linear workspace slug (from `linear auth whoami`) | `acme-corp` |
| `<TEAM_KEY>` | Linear team key (from `linear team list`) | `ENG` |

These are determined interactively during init mode. No manual editing required.

---

## Detect Mode

Read `$ARGUMENTS`:
- If `$ARGUMENTS` is exactly `init`, go to **Init Mode (Steps 1-4)**.
- If `$ARGUMENTS` is empty, ask the user for a ticket title or whether they want to run init.
- Otherwise, go to **Create Mode (Steps 5-9)**.

---

# Init Mode

**Announce at start:** "Setting up the linear CLI for this project..."

## Step 1: Check CLI Installation

Run `which linear` to check if the `linear` CLI is installed.

### If not installed

Tell the user to install it:

```bash
brew install schpet/tap/linear
```

Alternative install methods:
- npm: `npm install -g @schpet/linear-cli`
- deno: `deno install -A --reload -f -g -n linear jsr:@schpet/linear-cli`
- Binaries: https://github.com/schpet/linear-cli/releases/latest

Wait for the user to confirm installation before continuing.

### If installed

Print the version (`linear --version`) and continue.

## Step 2: Check Authentication

Run `linear auth whoami` to check if the CLI is authenticated.

### If not authenticated

Guide the user through authentication:

1. Create a Linear API key at https://linear.app/settings/account/security
   - Scroll to "Personal API keys"
   - Click "Create key", give it a label like "CLI"
   - Copy the key (starts with `lin_api_`)
2. Tell the user to run `linear auth login` in their terminal
   - This is an interactive command -- the user must run it themselves
   - It will prompt for the API key and store it in the system keyring

After the user confirms they have logged in, verify by running `linear auth whoami` again.

### If authenticated

Display the workspace and user info and continue.

## Step 3: Configure Project

Check if a `.linear.toml` file exists in the project root.

### If `.linear.toml` exists

Read it and verify it contains a `team_id`. Display the current config and continue.

### If `.linear.toml` does not exist

Set up the project config:

1. Run `linear team list` to show all available teams.
2. Ask the user which team they want tickets created under. Present the team names and keys from the list output.
3. Run `linear auth whoami` to get the workspace slug.
4. Create a `.linear.toml` file in the project root with the chosen team:

```toml
workspace = "<WORKSPACE_SLUG>"
team_id = "<TEAM_KEY>"
```

For example, if the user picks a team with key `ENG` in workspace `acme-corp`:
```toml
workspace = "acme-corp"
team_id = "ENG"
```

Ask the user to confirm before writing the file.

## Step 4: Verify Setup

Run a quick verification to confirm everything works end-to-end:

```bash
linear issue list -s todo
```

### If successful

Announce that setup is complete:

```
Setup complete! You can now use /create-ticket <title> to create tickets.
```

### If it fails

Display the error and suggest troubleshooting steps:
- Check `linear auth whoami` for auth issues
- Check `.linear.toml` for config issues
- Refer to https://github.com/schpet/linear-cli for documentation

---

# Create Mode

**Announce at start:** "Creating a new Linear ticket..."

## Step 5: Verify Prerequisites

Run `linear auth whoami` to confirm the CLI is authenticated.

- If not authenticated, tell the user to run `/create-ticket init` first and stop.
- If authenticated, continue.

## Step 6: Parse Arguments

Use `$ARGUMENTS` as free-text input to derive ticket fields:

- **Title**: extract a concise, clean ticket title from the input. If the input is already a short phrase, use it as-is. If it is a longer description, summarize it into a clear title.
- **Description**: always generate a description with the two mandatory sections below. Every ticket must have both sections -- never create a ticket without them.

### Description Format

The description must always contain these two markdown sections in this order:

```markdown
## Background

<Why does this ticket exist? What is the context or motivation?>

## Definition of Done

- [ ] <Concrete acceptance criterion 1>
- [ ] <Concrete acceptance criterion 2>
- [ ] <...>
```

#### Background section rules

- Explain **why** this work is needed -- the context, motivation, or problem being solved.
- Derive it from the user's input. If the user provided enough context, write 1-3 sentences.
- If the user's input is too brief to write a meaningful background, ask a follow-up question before proceeding.
- Do not pad with filler. A single clear sentence is fine.

#### Definition of Done section rules

- List concrete, verifiable acceptance criteria as checkbox items (`- [ ]`).
- Derive criteria from what the user described. If the user said "set up monitoring", reasonable criteria are things like "dashboards created", "alerts configured", "alerts verified".
- Aim for **2-5 criteria**. Each should be a clear pass/fail condition.
- Do not invent requirements the user did not imply. If you cannot infer at least 2 criteria from the input, ask the user a clarifying question to fill this in.

### Rules

- Do not invent requirements the user did not mention or imply.
- Keep the title under 80 characters.
- Write the description in plain language, not corporate speak.
- If the input is too brief to produce both a meaningful Background and at least 2 Definition of Done criteria, ask a clarifying question before proceeding.
- Never create a ticket with an empty description.

## Step 7: Confirm with User

Present the drafted ticket to the user for confirmation using the `question` tool:

- Show the **title** and **full description** (with both Background and Definition of Done sections)
- Options:
  - "Create this ticket" -- proceed to create
  - (custom answer -- the user can edit or cancel)

This is a safety step since we are creating a real ticket in Linear.

## Step 8: Create the Ticket

Run the `linear issue create` command:

```bash
linear issue create -t "<title>" -d "<description>"
```

The description must include the `## Background` and `## Definition of Done` sections.

The CLI uses the team configured in `.linear.toml`, so no team flag is needed.

## Step 9: Report Result

After the ticket is created, display:

- The ticket identifier (e.g., `ENG-123`)
- The ticket title
- The URL (run `linear issue url` or construct from the identifier)

### Output format

```
Created <TEAM_KEY>-<ID>: <title>
URL: https://linear.app/<WORKSPACE_SLUG>/issue/<TEAM_KEY>-<ID>
Status: Todo | Priority: Normal | Assignee: Unassigned
```

---

## Example Output (Init Mode)

```
Setting up the linear CLI for this project...

[ok] linear CLI is installed (v1.9.1)
[ok] Authenticated as Jane Doe (jane@example.com) on workspace Acme Corp
[action] No .linear.toml found. Creating project config...
[action] Available teams:
  - ENG (Engineering)
  - DES (Design)
  - OPS (Operations)
[action] User selected: ENG (Engineering)
[ok] Created .linear.toml with workspace "acme-corp" and team "ENG"
[ok] Verified: linear issue list works.

Setup complete! You can now use /create-ticket <title> to create tickets.
```

## Example Output (Create Mode)

```
Creating a new Linear ticket...

Title: Set up monitoring for the new staging environment
Description:
## Background
The new staging environment needs monitoring and alerting coverage.
Currently there is no visibility into service health, sync status, or resource
utilization for this deployment.

## Definition of Done
- [ ] Monitoring dashboards created for service health and sync status
- [ ] Alerts configured for resource utilization thresholds
- [ ] Alerts verified in a test scenario

> Create this ticket? [Create this ticket / custom answer]

Created ENG-456: Set up monitoring for the new staging environment
URL: https://linear.app/acme-corp/issue/ENG-456
Status: Todo | Priority: Normal | Assignee: Unassigned
```

## Important Notes

- The `.linear.toml` config determines which team tickets are created under. Run `/create-ticket init` to change the team.
- **NEVER** include secrets, API keys, tokens, passwords, or sensitive credentials in ticket titles or descriptions.
- **NEVER** read or expose the contents of auth credential files (e.g., `~/.config/linear/credentials.toml` API key values).
- If `linear auth whoami` fails or the CLI is not installed, direct the user to `/create-ticket init` rather than attempting manual workarounds.
- If the user provides context that contains sensitive data (IPs, keys, tokens), redact them before including in the ticket.
