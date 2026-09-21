# Create Linear Ticket

## Overview

A Claude Code skill that creates Linear tickets from natural language descriptions using the `linear` CLI.

- **Two modes**: init (first-time setup) and create (ticket creation)
- **Team-agnostic**: works with any Linear team and workspace
- **Structured tickets**: every ticket gets a Background section and Definition of Done with acceptance criteria
- **Safety step**: always confirms with the user before creating a ticket

## Use Cases

- Quickly create well-structured Linear tickets from the command line
- Set up the `linear` CLI for a new project
- Create tickets with consistent formatting (Background + Definition of Done)

## Prerequisites

- [linear CLI](https://github.com/schpet/linear-cli) (`schpet/linear-cli`)
- A Linear account with API key access
- macOS, Linux, or Windows with a supported package manager

## Usage

```
/create-ticket init          # First-time setup
/create-ticket <title>       # Create a ticket from a description
```

### First-time setup

Run `/create-ticket init` to:
1. Verify the `linear` CLI is installed
2. Authenticate with your Linear workspace
3. Choose which team to create tickets under
4. Generate a `.linear.toml` config file

### Creating tickets

Run `/create-ticket <title or description>` to create a ticket. The skill will:
1. Parse your input into a title and structured description
2. Present a draft for your confirmation
3. Create the ticket via `linear issue create`

## What Gets Configured

| Item | Location | Purpose |
|---|---|---|
| `.linear.toml` | Project root | Stores workspace slug and team key |
| Linear CLI auth | System keyring | API key for Linear access |

## Security Considerations

- Secrets, API keys, tokens, and passwords are never included in ticket content
- Auth credential files are never read or exposed
- Sensitive data in user input is redacted before ticket creation
- The CLI stores API keys in the system keyring, not in plaintext files

## Expected Results

- Linear CLI installed and authenticated
- `.linear.toml` created in the project root with your chosen team
- Tickets created with structured Background and Definition of Done sections
- Ticket URL displayed after creation

## Troubleshooting

| Problem | Solution |
|---|---|
| `linear: command not found` | Install via `brew install schpet/tap/linear` or see [releases](https://github.com/schpet/linear-cli/releases/latest) |
| `linear auth whoami` fails | Run `linear auth login` with a fresh API key from [Linear settings](https://linear.app/settings/account/security) |
| `.linear.toml` has wrong team | Delete `.linear.toml` and run `/create-ticket init` again |
| `linear issue list` fails | Check both auth (`linear auth whoami`) and config (`.linear.toml`) |

## Technical Details

- **CLI**: [schpet/linear-cli](https://github.com/schpet/linear-cli)
- **Config format**: TOML (`.linear.toml`)
- **Auth storage**: System keyring via `linear auth login`
- **Platforms**: macOS (Homebrew), any OS (npm, deno, binary)

## License

MIT License - see [LICENSE](./LICENSE) for details.
