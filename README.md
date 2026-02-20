# Agent Skills Collection

A collection of reusable operational skills and runbooks for common infrastructure and deployment tasks, formatted as Claude Code Skills.

## Purpose

This repository contains Claude-compatible skills that can be executed by AI agents (particularly Claude) or human operators to perform common infrastructure setup and maintenance tasks in a consistent, repeatable manner. Skills are organized following the Claude Code Skills format with proper metadata and structure.

## Available Skills

### Server Setup & Configuration

#### [Hetzner Server Initial Setup with Docker](./.claude/skills/setup-hetzner-docker-server/)
Initialize a fresh Hetzner Ubuntu server with a non-root user configured for Docker application deployment.

**What it does:**
- Creates a non-root user (ubuntu) with home directory
- Sets up `/data` directory with proper permissions
- Configures passwordless sudo access
- Adds user to docker group for container management
- Copies SSH keys from root to the new user
- Disables SSH password authentication for security
- Verifies all configurations are working

**Use cases:**
- Setting up new Hetzner servers for Docker applications
- Preparing servers for automated deployments
- Securing server access with SSH key-based authentication

### Git & GitHub Workflow

#### [Git Commit, Push, and Pull Request](./.claude/skills/git-commit-push-pr/)
Commit all changes, push to remote, and create a GitHub pull request with an auto-generated description.

**What it does:**
- Detects the repository's default branch automatically
- Creates a feature branch if currently on the default branch
- Stages all changes and commits with a conventional commit message
- Pushes to the remote with upstream tracking
- Checks for an existing open PR and skips creation if found
- Creates a new PR with a structured description (Summary, Changes, Notes)

**Use cases:**
- Wrapping up work and submitting changes for review in one step
- Quickly opening a PR after finishing a feature or bug fix
- Pushing additional commits to an existing open PR

## Usage

### Using Skills with Claude
Skills in this repository follow the Claude Code Skills format and can be used directly with Claude:

1. Skills are organized in `.claude/skills/` directory
2. Each skill has a `SKILL.md` with metadata (name, description, allowed tools)
3. Skills can be invoked by name when using Claude Code
4. Each skill includes step-by-step instructions and verification steps

### Manual Usage
Each skill can also be executed manually and contains:
1. **Prerequisites** - What you need before starting
2. **Step-by-step commands** - Ready-to-execute bash commands
3. **Verification steps** - How to confirm everything works
4. **Customization variables** - Values you need to replace (marked with `<>`)
5. **Security notes** - Important security considerations
6. **Troubleshooting** - Common issues and solutions

## Contributing

To add a new skill:
1. Create a new directory under `.claude/skills/` with a descriptive name (e.g., `setup-kubernetes-cluster`)
2. Create a `SKILL.md` file with proper frontmatter:
   ```markdown
   ---
   name: your-skill-name
   description: Brief description of what the skill does
   allowed-tools: [Bash, Read, Grep]  # Optional
   ---
   ```
3. Create a `README.md` with user-facing documentation
4. Copy the `LICENSE` file to the skill directory
5. Include all necessary commands, verification steps, and documentation in SKILL.md
6. Update the root README with a reference to your new skill

### Claude Skill Format Requirements
- Skills must have a `SKILL.md` file with YAML frontmatter
- Name should be lowercase with hyphens (kebab-case)
- Description should clearly state when the skill should be used
- Include clear prerequisites, steps, and verification procedures
- Document all customization variables and security considerations

## License

See [LICENSE](./LICENSE) file for details.
