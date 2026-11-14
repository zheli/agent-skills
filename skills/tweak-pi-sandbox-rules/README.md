# Tweak Pi Sandbox Rules

## Overview

Adjust [pi-sandbox](https://github.com/carderne/pi-sandbox) without unnecessarily widening access.

- Choose global or project rules before editing.
- Preserve JSON comments, unrelated rules, and needed defaults.
- Verify allowed and denied actions in a fresh Pi instance, preferably a subagent.

## Use Cases

- Allow a specific network host or filesystem path.
- Diagnose blocked commands or SSH-agent signing.
- Remove or narrow existing permissions.

## Prerequisites

Pi with pi-sandbox installed and enabled, its OS dependencies (including ripgrep), and permission
to edit the selected configuration. Bundled helpers require Node.js and Bash; network probes need curl.

## Usage

Install from this collection:

```bash
npx skills add https://github.com/zheli/agent-skills --skill tweak-pi-sandbox-rules
```

Reload skills or start a new session, then invoke:

```text
/skill:tweak-pi-sandbox-rules Allow this project to reach packages.example.com
```

The agent asks you to choose scope and confirm the minimal rule. It may launch fresh Pi instances
to test it, preferring subagents where available. It must report when sandbox enforcement cannot
be verified rather than treating a helper's exit code as proof.

## What Gets Configured

| Scope/item | Change |
| --- | --- |
| Global | `$PI_CODING_AGENT_DIR/sandbox.json`, default `~/.pi/agent/sandbox.json` |
| Project | `<PROJECT_DIR>/.pi/sandbox.json`; requires project trust |
| Existing configuration | Targeted edits preserving comments and unrelated settings |
| Test fixtures | A write probe briefly creates a unique file in the approved directory |

`<PROJECT_DIR>` means your project's absolute directory. No actual sandbox rules are changed by
installing this skill.

## Security Considerations

⚠️ **Global permissions** affect every project. Write grants also grant read access.

⚠️ **Sensitive grants** such as secret-store access, unrestricted networking, broad sockets, and
process signals require explicit approval. The skill must not disable the sandbox to make tests pass.

⚠️ **Fresh Pi tests** may consume model/API resources. Project approval loads trusted project-local
resources, potentially including executable extensions. Tests must use harmless fixtures, not secrets.

## Expected Results

- ✅ You choose global or project scope before any edit.
- ✅ The selected file passes syntax/common-type checks.
- ✅ Fresh-instance tests demonstrate the intended allowance and a nearby denial, or report unverified.
- ✅ You receive the changed keys, evidence, and restart instructions.

## Troubleshooting

- **Project rule ignored:** check test cwd, project trust, and extension loading.
- **Permission remains:** check both config layers; arrays merge, so project entries cannot subtract global grants.
- **Linux bash ignores a rule:** use literal write paths rather than globs.
- **Probe reports ERROR:** inspect stderr; missing files, DNS, TLS, and OS permissions are not proof of sandbox denial.
- **Nested Pi fails to start:** use a suitable subagent or run the proposed test yourself; do not bypass protection.
- **Need rollback:** restore only the recorded changes and validate again, then restart the session.

## Technical Details

- Platforms: macOS and Linux with the corresponding pi-sandbox runtime dependencies.
- Config format: JSON with comments; no trailing commas.
- Array defaults apply only when neither global nor project config supplies that array.
- `allowProcessSignals` is global-only.
- Tests: fresh Pi sessions; at most three failed adjustment rounds before stopping.
- `scripts/check-config.mjs`: validates one file's syntax and common types, not merged/runtime policy.
- `scripts/probe.sh`: tests bash read, directory write, HTTP(S), or harmless command execution. It reports
  ALLOWED on command success and ERROR on failure; classify BLOCKED only with denial evidence.
- Restart existing sessions after rule changes to reliably rebuild the sandbox.

Run helper regression tests from the repository root (these do not test sandbox enforcement):

```bash
node --test skills/tweak-pi-sandbox-rules/scripts/helpers.test.mjs
```

## License

MIT. See [LICENSE](./LICENSE).
