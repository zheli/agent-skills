# Agent Skills Collection

A collection of reusable Claude Code Skills for infrastructure, deployment, and development workflow tasks.

## Available Skills

### Server Setup & Configuration

- **[Hetzner Server Initial Setup with Docker](./.claude/skills/setup-hetzner-docker-server/)** - Initialize a fresh Hetzner Ubuntu server with a non-root user configured for Docker application deployment.

### Git & GitHub Workflow

- **[Git Commit, Push, and Pull Request](./.claude/skills/git-commit-push-pr/)** - Commit all changes, push to remote, and create a GitHub pull request with an auto-generated description.

### Project Management

- **[Markdown Task Tracking](./.claude/skills/markdown-task-tracking/)** - Track project tasks and epics in individual markdown files under `docs/`, with `docs/PROJECT.md` as the central index.

## Contributing

1. Create a new directory under `.claude/skills/<skill-name>/`
2. Add `SKILL.md` (with YAML frontmatter), `README.md`, and `LICENSE`
3. Add a reference here under the appropriate category

## License

See [LICENSE](./LICENSE) file for details.
