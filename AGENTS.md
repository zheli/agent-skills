# Agent Guidelines for agent-skills Repository

This document provides essential information for AI coding agents working in this repository.

## Repository Overview

This is a collection of Claude Code Skills for infrastructure and deployment tasks. Skills are documentation-based runbooks formatted as Markdown files with YAML frontmatter, located in `.claude/skills/`.

## Project Structure

```
.
├── .claude/
│   └── skills/
│       └── {skill-name}/          # Each skill in its own directory
│           ├── SKILL.md            # Main skill file with YAML frontmatter
│           ├── README.md           # User-facing documentation
│           └── LICENSE             # MIT license (required)
├── README.md                       # Root documentation
└── LICENSE                         # MIT license
```

## Build/Lint/Test Commands

**No build system** - This is a documentation-only repository.

### Validation Tasks

```bash
# Check YAML frontmatter syntax in SKILL.md files
grep -A 5 "^---$" .claude/skills/*/SKILL.md

# Validate Markdown formatting
find . -name "*.md" -not -path "./.git/*" -type f

# Check for required files in each skill
for skill in .claude/skills/*/; do
  echo "Checking $skill"
  ls -1 "$skill" | grep -E "(SKILL.md|README.md|LICENSE)"
done

# Search for placeholder variables that need documentation
grep -r "<[A-Z_]*>" .claude/skills/
```

### Testing a Single Skill

To manually test/verify a skill's commands:
```bash
# Review the skill's commands (do not execute without user approval)
cat .claude/skills/{skill-name}/SKILL.md

# Validate YAML frontmatter
head -n 6 .claude/skills/{skill-name}/SKILL.md
```

## Code Style Guidelines

### File Naming Conventions

- **Skill directories**: `kebab-case` (e.g., `setup-hetzner-docker-server`)
- **Skill names in frontmatter**: `kebab-case` matching directory name
- **Required files**: `SKILL.md`, `README.md`, `LICENSE` (exact case)
- **Documentation**: `*.md` in Title Case for titles, sentence case for content

### YAML Frontmatter Format

Every `SKILL.md` must start with:

```yaml
---
name: skill-name-in-kebab-case
description: Single sentence describing when to use this skill (imperative mood)
allowed-tools: [Bash, Read, Grep]  # Optional - list of tools skill can use
---
```

**Required fields**: `name`, `description`
**Optional fields**: `allowed-tools`

### Markdown Structure

**SKILL.md structure** (in order):
1. YAML frontmatter (required)
2. `# Title` - H1 heading matching skill name
3. `## Purpose` - Brief overview
4. `## Prerequisites` - What's needed before starting
5. `## When to Use This Skill` - Use cases
6. `## Customization Variables` - Placeholder variables (e.g., `<SERVER_IP>`)
7. `## Steps` - Numbered sections with bash code blocks
8. `## Expected Results` - Success criteria with checkmarks
9. `## Security Notes` - Security implications and warnings
10. `## Troubleshooting` - Common issues and solutions
11. `## References` - External documentation links

**README.md structure**:
1. `# Title` - User-facing skill name
2. `## Overview` - Brief description with bullet points
3. `## Use Cases` - When to use this skill
4. `## Prerequisites` - Requirements
5. `## Usage` - How to invoke the skill
6. `## What Gets Configured` - Table of changes made
7. `## Security Considerations` - Warnings with ⚠️ emoji
8. `## Expected Results` - Checkmarks ✅ for success criteria
9. `## Troubleshooting` - Common issues
10. `## Technical Details` - OS, timing, defaults
11. `## License` - License reference

### Formatting Conventions

**Code blocks**:
- Use triple backticks with language identifier: ` ```bash `
- Include comments for non-obvious commands
- One logical operation per code block
- Always show verification commands after changes

**Variables**:
- Placeholders: `<VARIABLE_NAME>` (uppercase with angle brackets)
- Always document all placeholders in "Customization Variables" section
- Example: `<SERVER_IP>`, `<TEMP_PASSWORD>`

**Security warnings**:
- Use ⚠️ emoji for security notes
- Bold important security implications: `**Docker Group**:`
- Always mention when actions grant elevated privileges

**Success indicators**:
- ✅ or ✓ for completed/verified items
- Use bullet points for expected results
- Include verification commands in each step

### Writing Style

**Tone**: Professional, imperative, concise
**Voice**: Active voice, second person ("you") in README, procedural in SKILL.md
**Headings**: Use `##` for major sections, `###` for subsections
**Lists**: Use `-` for unordered, `1.` for ordered (auto-numbering)
**Line length**: No hard limit, but break at logical points (~100-120 chars)
**Blank lines**: One blank line between sections, none within code blocks

### Bash Command Style

**Format**:
```bash
# Comment explaining the command
ssh root@<SERVER_IP> 'command to execute'

# Verification step
ssh root@<SERVER_IP> 'verification command'
```

**Rules**:
- Use single quotes for SSH commands
- Include verification after each change
- Chain related commands with `&&`
- Add comments for complex operations
- Show expected output where helpful

### Error Handling

**In documentation**:
- Include a `## Troubleshooting` section
- Document common error messages
- Provide solutions or workarounds
- Reference relevant system differences (e.g., Ubuntu version changes)

**In commands**:
- Use verification steps to catch errors
- Provide rollback instructions where applicable
- Warn about irreversible actions

### Documentation Requirements

**Every skill must have**:
1. Clear prerequisites
2. Customization variables documented
3. Step-by-step commands
4. Verification commands
5. Security considerations
6. Troubleshooting section
7. Expected results
8. References to official documentation

**Every command should have**:
- A comment explaining its purpose
- A verification step
- Expected output (if not obvious)

## Contributing New Skills

1. Create directory: `.claude/skills/{skill-name}/`
2. Create `SKILL.md` with proper frontmatter
3. Create `README.md` with user documentation
4. Copy `LICENSE` file from repository root
5. Update root `README.md` with skill reference
6. Ensure all placeholder variables are documented
7. Test all commands manually before committing
8. Verify YAML frontmatter parses correctly

## Security Considerations

- Never commit actual credentials or IP addresses
- Always use placeholder variables for sensitive data
- Document security implications of privileged operations
- Warn about commands that grant root-equivalent access
- Remind users to test before disabling authentication

## Quality Checklist

Before committing a new skill:
- [ ] YAML frontmatter is valid
- [ ] All required sections are present
- [ ] All placeholder variables are documented
- [ ] Commands include verification steps
- [ ] Security implications are clearly stated
- [ ] Troubleshooting section is comprehensive
- [ ] LICENSE file is present
- [ ] Root README.md is updated
- [ ] All commands use absolute paths or are environment-agnostic
- [ ] Expected results include checkmarks

## License

All skills must be licensed under MIT License (see repository LICENSE file).
