---
name: tweak-pi-sandbox-rules
description: Adjust global or project pi-sandbox rules for blocked filesystem, network, socket, or command access and verify the changes in a fresh Pi instance.
---

# Tweak Pi Sandbox Rules

## Purpose

Tune [carderne/pi-sandbox](https://github.com/carderne/pi-sandbox) with the narrowest effective rule.
Ask the user to choose global or project scope, preserve existing configuration, and test both allowed
and denied behavior in a fresh sandboxed Pi instance.

## Prerequisites

- Pi with pi-sandbox installed and enabled; inspect the installed version and its documentation.
- Node.js for the config checker; Bash and curl for the optional probes.
- Working sandbox dependencies: ripgrep on both platforms and the runtime's Linux dependencies
  (including bubblewrap). Fix initialization errors before interpreting access tests.
- Permission to edit the chosen configuration. Never bypass the current sandbox to obtain it.

## When to Use This Skill

Use for blocked domains, filesystem read/write failures, SSH-agent access, or requests to add,
remove, or narrow sandbox rules. A command failure alone is not proof of a sandbox denial.

## Customization Variables

Replace these placeholders before executing examples; quote paths as shell arguments.

| Placeholder | Meaning |
| --- | --- |
| `<PROJECT_DIR>` | Absolute project directory, also the test instance's cwd |
| `<SKILL_DIR>` | Absolute directory containing this skill |
| `<CONFIG_FILE>` | User-selected global or project sandbox.json |
| `<TEST_TASK>` | Concrete probe instructions, expected results, and safety constraints |

## Steps

### 1. Confirm the target and scope

Inspect the failed action and both configuration files. Always ask with `ask_user_question` before editing:

- **Project** (recommend for project-specific paths/hosts): `<PROJECT_DIR>/.pi/sandbox.json`.
  Loads only when Pi trusts that project.
- **Global**: `$PI_CODING_AGENT_DIR/sandbox.json`, defaulting to `~/.pi/agent/sandbox.json`.
  Affects every project.

Group any unresolved choices (read versus write, exact file versus directory) into the same question.
Explain that `allowProcessSignals` is global-only if requested. Confirm the exact proposed rule.
Do not edit a different scope without asking again.

### 2. Resolve the effective policy

Read the installed extension's README and configuration implementation when behavior differs.
Current upstream semantics:

- Files accept JSON comments, not trailing commas.
- Arrays from global and trusted project configs combine and deduplicate:
  `network.allowedDomains`, `deniedDomains`, `allowUnixSockets`, `allowMachLookup`,
  and `filesystem.allowRead`, `denyRead`, `allowWrite`, `denyWrite`.
- An array's built-in defaults apply only when neither file configures it. Even `[]` replaces
  defaults. Preserve needed defaults when first setting an array; do not blindly create a one-entry list.
- Removing a project entry cannot remove a matching global grant. Inspect both layers before narrowing.
- Project scalar settings override global settings, except global-only `allowProcessSignals`.
- Reads require `allowRead` or `allowWrite`; `denyRead` is a soft default, not a hard prohibition.
  Writes also grant reads; `denyWrite` wins over write grants and is never prompted.
- `.` means the session cwd; `~` expands to home. Resolve symlinks when diagnosing paths.
  Linux bash ignores globs in write allow/deny rules; direct read/write/edit tools still honor them.
  Use literal paths for Linux bash restrictions.
- Prefer exact hosts to wildcards. Check `deniedDomains` as well as the allowed list.
- Prefer `network.allowSSHAgentSocket` for macOS signing to broad socket grants.
  `network.disabled: true` removes network isolation, not just one blocked host.

Choose the narrowest permission. Never add secret stores, home-wide grants, wildcard domains,
broad sockets, or disabled isolation without explicit approval for that expansion.

### 3. Edit and validate

Record the original contents (or that the file did not exist) for rollback. Use targeted edits to
preserve comments and unrelated settings. Create missing files with only necessary keys, while
preserving defaults for any newly configured arrays. Never overwrite malformed configuration.

If the current sandbox blocks a write, stop and request permission for the exact path, for example
`/sandbox-allow write <CONFIG_FILE>`, or ask the user to apply the patch. Do not disable protection.

```bash
# Check JSONC syntax and common configuration types after the edit.
node "<SKILL_DIR>/scripts/check-config.mjs" "<CONFIG_FILE>"
```

Require exit 0. This checker inspects one file, not merged defaults, trust, or OS enforcement;
successful validation does not establish that a rule works.

### 4. Verify in a fresh Pi instance

You may launch a new Pi instance to test rules; prefer a subagent when available.
Read its tool instructions, set cwd to the exact project, and verify that it actually loads
pi-sandbox, the intended config layers, and no inherited session-only grants. A subagent is not
automatically a sandboxed test just because it is a separate agent.

Check project trust explicitly. One-run `-a` approves project-local resources, including executable
extensions: use it only when the user trusts those resources. `-na` ignores trust-gated project
resources; a global-only test must still load pi-sandbox from a global installation.

Fallback when a suitable subagent is unavailable:

```bash
# Start an ephemeral session in the trusted project; inspect its tool evidence.
cd "<PROJECT_DIR>" && pi -p --no-session -a --tools read,bash "<TEST_TASK>"
```

Do not pass `--no-sandbox`, disable extensions, or disable policy. Headless pi-sandbox permission
prompts abort rather than granting access. If nested Pi is blocked (for example a trust-file lock
gets EPERM), use a correctly configured subagent or ask the user to run the test; do not bypass it.

The test task must:
1. Confirm sandbox enabled/config loaded using `sandbox_status` if available, otherwise startup
   evidence and a known-denied control. If enforcement cannot be established, report unverified.
2. Run the intended action and a nearby action expected to stay blocked, selected from effective
   policy, not an arbitrary sibling that might already be allowed.
3. Run one probe per bash tool call; a blocked network request can fail the entire call.
4. Test direct read/write/edit tools separately when relevant: bash probes cover only bash policy.
5. Never request extra permissions, edit configs, print secrets, or retry via an unsandboxed route.
6. Return command/tool, expected result, actual result, exit/error, and evidence.

Bundled bash probes (run only inside the fresh sandbox under test):

```bash
# Inspect usage without performing a probe.
bash "<SKILL_DIR>/scripts/probe.sh" --help
```

Use `read` with a non-secret existing fixture, `write` with an existing approved directory,
`net` with an innocuous URL, and `exec` only with a harmless command such as a version check.
Write probes create and remove a unique temporary file in the directory; they do not test an exact
file rule. Use a disposable exact-file fixture and the relevant tool for those rules.
A probe failure is ERROR until denial evidence distinguishes policy from missing paths,
DNS/TLS errors, unavailable binaries, or ordinary OS permissions.

### 5. Iterate and report

For unexpected results, inspect trust, both config layers, symlinks, Linux globs, dependency errors,
and extension loading. Re-test each revision in another fresh instance.
Stop after three failed rounds and report the evidence instead of widening rules indiscriminately.

Report scope, file, changed keys, positive/negative test table, and any unverified checks.
Tell the user to restart existing sessions to reliably rebuild the sandbox.

## Expected Results

- ✅ User explicitly selected global or project scope.
- ✅ Minimal changes preserve unrelated rules and needed defaults.
- ✅ Validation passes and a fresh sandbox confirms both positive and negative controls.
- ✅ Remaining limitations and restart requirements are reported honestly.

## Security Notes

⚠️ **Global rules** affect all projects. Write grants also permit reading the same paths.
Never grant root-equivalent, credential-store, SSH-agent, process-signal, or unrestricted network
access as an incidental fix. Explain and obtain approval for sensitive changes.

⚠️ **Testing** can write files, contact hosts, and consume model/API resources. Use harmless fixtures,
no secrets or destructive commands. Do not copy upstream's permissive browser example wholesale.

## Troubleshooting

- **Project rule ignored:** verify cwd and project trust, then restart the test instance.
- **Still denied:** inspect denyWrite, domain denies, canonical paths, and Linux write globs.
- **Too much allowed:** inspect global entries and broad existing grants; project lists cannot subtract them.
- **Checker passes but action fails:** syntax is not runtime validation; inspect extension/dependency startup.
- **Probe fails without a denial:** report ERROR, not BLOCKED; investigate the underlying command.
- **Rollback:** restore only this task's edits from the recorded original. If this task created the file,
  remove it only if no subsequent changes exist. Validate again and restart/test in a fresh instance.

## References

- [pi-sandbox README](https://github.com/carderne/pi-sandbox)
- [Configuration, defaults, and merging](https://github.com/carderne/pi-sandbox/blob/main/src/config.ts)
- [Sandbox runtime](https://github.com/carderne/sandbox-runtime)
- [Pi documentation](https://github.com/earendil-works/pi)
