# Manage Repository Runtime Secrets

A Claude skill for injecting repository runtime secrets into environment variables using the `pass` CLI and a local `.envrc` file (direnv).

## Overview

This skill helps you:
- Store secrets in pass under `{repo_name}/{secret_name}`
- Inject secrets into env vars from `.envrc` via `pass show`
- Add new secrets with `pass add`
- Keep `.envrc` local and out of git

## Use Cases

- Local development that needs API keys, tokens, or database URLs
- Onboarding a developer to an existing pass-backed secret layout
- Adding a new runtime secret for a repository
- Standardizing how repos load secrets without committing values

## Prerequisites

Before using this skill, ensure you have:
- `pass` installed and initialized
- `direnv` installed and hooked into your shell
- A usable GPG key for the pass store
- A git repository checkout

## Usage

1. Invoke the skill: `@manage-repo-runtime-secrets`
2. Provide or confirm:
   - Repository namespace (`<REPO_NAME>`)
   - Secret name (`<SECRET_NAME>`)
   - Environment variable name (`<SECRET_VAR>`)
3. Add secrets with pass, update `.envrc`, then run `direnv allow`
4. Confirm env vars are set without printing their values

## What Gets Configured

| Component | Configuration |
|-----------|--------------|
| pass entry | `<REPO_NAME>/<SECRET_NAME>` |
| Retrieve | `pass show <REPO_NAME>/<SECRET_NAME>` |
| Add secret | `pass add <REPO_NAME>/<SECRET_NAME>` |
| `.envrc` | `export <SECRET_VAR>="$(pass show <REPO_NAME>/<SECRET_NAME>)"` |
| Git ignore | `.envrc` kept out of version control |
| Shell load | direnv loads exports when entering the directory |

## Security Considerations

⚠️ **Important Security Notes:**
- Do not commit `.envrc` files that load real secrets
- Never paste decrypted secret values into tickets, PRs, or chat
- Prefer checking that a variable is set (`test -n`) over printing it
- Each developer needs access to the corresponding pass entries
- Avoid putting literal secret values on the command line (shell history)

## Expected Results

After successful execution:
- ✅ Secret stored in pass at `<REPO_NAME>/<SECRET_NAME>`
- ✅ `.envrc` exports the env var via `pass show`
- ✅ `.envrc` is gitignored
- ✅ `direnv allow` loads the variable into the shell
- ✅ New secrets can be added with `pass add`

## Troubleshooting

### Common Issues

**Secret not found in pass**
- Path or namespace mismatch
- Solution: `pass ls <REPO_NAME>`, then `pass add <REPO_NAME>/<SECRET_NAME>`

**direnv not loading**
- Hook missing or `.envrc` not allowed
- Solution: install the direnv shell hook, then `direnv allow .`

**GPG decryption failures**
- Locked agent or wrong key
- Solution: unlock GPG and confirm the password store directory

## Technical Details

- **Secret store**: pass (GPG-encrypted password-store)
- **Injection mechanism**: direnv + `.envrc` exports
- **Path convention**: `<REPO_NAME>/<SECRET_NAME>`
- **Export pattern**: `export <SECRET_VAR>="$(pass show <REPO_NAME>/<SECRET_NAME>)"`

## License

MIT License - see [LICENSE](./LICENSE) file for details.
