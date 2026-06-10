# Agent Skills Collection

A collection of reusable Claude Code Skills for infrastructure, deployment, and development workflow tasks.

## Available Skills

### Server Setup & Configuration

- **[Hetzner Server Initial Setup with Docker](./.claude/skills/setup-hetzner-docker-server/)** - Initialize a fresh Hetzner Ubuntu server with a non-root user configured for Docker application deployment.

### Git & GitHub Workflow

- **[Git Commit, Push, and Pull Request](./.claude/skills/git-commit-push-pr/)** - Commit all changes, push to remote, and create a GitHub pull request with an auto-generated description.
- **[Code Review](./.claude/skills/code-review/)** - Dispatch a code reviewer subagent to evaluate completed work against requirements, returning categorized issues (Critical / Important / Minor) and a clear merge verdict.

### Network Configuration

- **[Configure Hetzner Cloud Floating IP](./.claude/skills/configure-hetzner-floating-ip/)** - Configure a Hetzner Cloud Floating IP persistently on Ubuntu servers using Netplan.

### Project Management

- **[Create Linear Ticket](./.claude/skills/create-ticket/)** - Create Linear tickets from natural language descriptions using the `linear` CLI, with structured Background and Definition of Done sections.
- **[Markdown Task Tracking](./.claude/skills/markdown-task-tracking/)** - Track project tasks and epics in individual markdown files under `docs/`, with `docs/PROJECT.md` as the central index.

### Documentation & Reporting

- **[Markdown to HTML Report](./.claude/skills/markdown-to-html-report/)** - Generate a self-contained, human-friendly companion HTML report from a markdown document, with optional GitHub Pages publishing and AES-GCM password protection.

## Adding Skills

You can add all skills from this collection to your project using:

```bash
npx skills add https://github.com/zheli/agent-skills
```

## Contributing

1. Create a new directory under `.claude/skills/<skill-name>/`
2. Add `SKILL.md` (with YAML frontmatter), `README.md`, and `LICENSE`
3. Add a reference here under the appropriate category

## License

See [LICENSE](./LICENSE) file for details.
