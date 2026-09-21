---
name: manage-repository-secrets
description: Manage repository secrets with pass and direnv by injecting values into environment variables via a local .envrc file. Use when setting up, adding, or loading secrets for local development with pass show/add and .envrc exports.
allowed-tools: [Bash, Read, Grep]
---

# Manage Repository Secrets

## Purpose
Store repository secrets in the [pass](https://www.passwordstore.org/) password store and inject them into the shell environment through a local `.envrc` file (loaded by direnv). Secrets stay out of git; each developer loads them locally from their own pass store.

## Prerequisites
- [pass](https://www.passwordstore.org/) installed and initialized (`pass init`)
- [direnv](https://direnv.net/) installed and hooked into the shell
- GPG key available for encrypting the pass store
- Repository checkout where secrets should be loaded

## When to Use This Skill
Use this skill when you need to:
- Inject secrets into environment variables for local development
- Add a new secret for a repository into the pass store
- Create or update a `.envrc` that exports secrets from pass
- Onboard a developer to an existing pass-backed `.envrc` setup

## Customization Variables
Before running commands, replace these placeholders:
- `<REPO_NAME>`: Password-store namespace for this repository (usually the repo directory name, e.g. `agent-skills`)
- `<SECRET_NAME>`: Name of the secret in pass (e.g. `api-key`, `database-url`)
- `<SECRET_VAR>`: Environment variable name to export (e.g. `API_KEY`, `DATABASE_URL`)

## Steps

### 1. Confirm Tools Are Available
```bash
# Verify pass is installed and the store is usable
pass --version
pass ls

# Verify direnv is installed and hooked
direnv version
```

Expected: `pass` and `direnv` print versions; `pass ls` lists the store (may be empty).

### 2. Determine the Repository Namespace
```bash
# Prefer the git repo name as the pass namespace
basename "$(git rev-parse --show-toplevel)"
```

Use that value as `<REPO_NAME>` unless the project documents a different namespace.

### 3. Add a Secret to Pass
```bash
# Create or update a secret (interactive prompt for the value)
pass add <REPO_NAME>/<SECRET_NAME>

# Verify the secret path exists (prints the value — do not share output)
pass show <REPO_NAME>/<SECRET_NAME>
```

### 4. Create or Update `.envrc`
Add an export line for each secret. Values are retrieved with `pass show` and injected into env vars:

```bash
# Create .envrc if missing
touch .envrc

# Append an export that loads the secret from pass into the env var
cat >> .envrc << 'EOF'
export <SECRET_VAR>="$(pass show <REPO_NAME>/<SECRET_NAME>)"
EOF
```

Example with concrete names:

```bash
export API_KEY="$(pass show my-app/api-key)"
export DATABASE_URL="$(pass show my-app/database-url)"
```

### 5. Decide Whether to Commit `.envrc`
Do **not** commit an `.envrc` that embeds secret values. You **may** commit an `.envrc` that has no secrets — for example one that only loads values via `pass show`:

```bash
# Safe to commit: no plaintext secrets, only pass paths
export API_KEY="$(pass show my-app/api-key)"
export DATABASE_URL="$(pass show my-app/database-url)"
```

```bash
# Not safe to commit: plaintext secret values
export API_KEY="sk-live-..."
export DATABASE_URL="postgres://user:password@host/db"
```

Before committing, review the file:

```bash
# Inspect .envrc for plaintext secrets (do not share output if any are present)
cat .envrc
```

If the file contains plaintext secrets, keep it local:

```bash
# Ignore secret-bearing .envrc
grep -qxF '.envrc' .gitignore 2>/dev/null || echo '.envrc' >> .gitignore
```

If the file only uses `pass show` (or other non-secret config), it is fine to commit:

```bash
git add .envrc
```

### 6. Allow direnv and Load Secrets
```bash
# Allow the .envrc for this directory (required after create/edit)
direnv allow .

# Enter the directory (or open a new shell) so direnv loads exports
cd .

# Verify the env var is set without printing the secret value
test -n "${<SECRET_VAR>}" && echo "<SECRET_VAR> is set" || echo "<SECRET_VAR> is missing"
```

### 7. List Secrets for This Repository
```bash
# Show pass entries under the repo namespace
pass ls <REPO_NAME>
```

## Expected Results
- ✅ Secrets stored under `pass` at `<REPO_NAME>/<SECRET_NAME>`
- ✅ `.envrc` exports each needed variable via `pass show`
- ✅ `.envrc` with no plaintext secrets may be committed; secret-bearing `.envrc` stays out of git
- ✅ `direnv allow` succeeds and env vars are present in the shell
- ✅ New secrets can be added with `pass add <REPO_NAME>/<SECRET_NAME>`

## Security Notes
⚠️ **Never commit `.envrc` that contains secret values** (API keys, passwords, tokens, connection strings with credentials).
⚠️ **`.envrc` without secrets is fine to commit** — including files that only call `pass show` to load values at runtime.
⚠️ **Do not print secret values** in logs, tickets, commits, or chat. Prefer `test -n "$VAR"` over `echo "$VAR"`.
⚠️ **pass encrypts with your GPG key** — teammates need their own pass entries (or a shared store setup); do not paste decrypted values into the repo.
⚠️ **Shell history** may capture `pass` commands; avoid embedding literal secret values on the command line.

## Troubleshooting

**`pass: <REPO_NAME>/<SECRET_NAME> is not in the password store`**
- The secret was never added, or the namespace differs
- Solution: `pass ls` / `pass ls <REPO_NAME>`, then `pass add <REPO_NAME>/<SECRET_NAME>`

**direnv does not load `.envrc`**
- direnv not hooked into the shell, or `.envrc` not allowed
- Solution: add `eval "$(direnv hook zsh)"` (or bash/fish) to the shell rc, then `direnv allow .`

**`gpg: decryption failed` / pass prompts fail**
- GPG agent not unlocked or wrong key
- Solution: unlock GPG (`gpg --list-secret-keys`, enter passphrase), confirm `PASSWORD_STORE_DIR` if using a non-default store

**Env var empty after `direnv allow`**
- Typo in path or export line; `pass show` failing inside `.envrc`
- Solution: run `pass show <REPO_NAME>/<SECRET_NAME>` manually, fix `.envrc`, then `direnv allow .` again

**Secret-bearing `.envrc` accidentally staged**
- Solution: `git restore --staged .envrc`, remove plaintext secrets (use `pass show` instead) or add `.envrc` to `.gitignore`

## References
- [pass (password-store)](https://www.passwordstore.org/)
- [direnv](https://direnv.net/)
- [direnv `.envrc` wiki](https://github.com/direnv/direnv/wiki)
