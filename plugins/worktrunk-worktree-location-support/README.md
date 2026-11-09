# Worktrunk Worktree Location Support

Use `worktree-path` from your Worktrunk user or source project config when creating
new Paseo worktrees.

## Configuration

The plugin reads the daemon user's config on every creation:

- `$XDG_CONFIG_HOME/worktrunk/config.toml` if XDG_CONFIG_HOME is nonempty.
- Otherwise `~/.config/worktrunk/config.toml` on macOS/Linux.

If the user file or its top-level `worktree-path` is missing, check
`<sourceCheckout>/.config/wt.toml` next. This is the checkout where creation starts,
not necessarily the main repository root. User settings take precedence.

For example:

```toml
worktree-path = ".worktrees/{{ branch }}"
```

For repository `/projects/app` and branch `feature/login`, this produces
`/projects/app/.worktrees/feature/login`. Relative paths resolve from the
**main repository root**, even when creation starts in another worktree.

If neither config supplies a top-level `worktree-path`, the hook does not modify the request:
Paseo keeps its default placement, including its normal collision handling.
Invalid TOML, an empty/non-string setting, unreadable config, or unsupported
template syntax fails creation with an error instead of silently choosing another path.

### Supported templates

| Syntax | Value |
| --- | --- |
| `{{ branch }}` | Raw requested branch name |
| `{{ repo }}` | Main repository directory name |
| `{{ repo_path }}` | Absolute main repository root |
| `{{ branch \| sanitize }}` | Replace slashes and backslashes with hyphens |

The `sanitize` filter works on any supported variable. Whitespace around variables
and filters is optional. Absolute paths and leading `~/` are supported.

This is not a full Worktrunk configuration implementation. It does not load
system config, `[projects]` overrides, or Worktrunk-specific environment
overrides. Other variables (such as `owner` and `remote_repo`), filters (such as
`sanitize_db` and `codename`), and Jinja control flow are unsupported and rejected.

## Setup

Requires Paseo 0.14.0-beta.1 or newer with plugins enabled on the target daemon.
Development checks require Node.js 24 or newer and npm.

1. If your template creates nested worktrees, ignore their parent directory in
   each repository. For `.worktrees/`, add it to `.gitignore` or
   `.git/info/exclude` and verify with `git check-ignore .worktrees/example`.
2. From this plugin directory, install dependencies and validate:

   ```bash
   npm ci
   npm run typecheck
   npm test
   ```

3. Install using the plugin's absolute directory path:

   ```bash
   paseo plugin install "$PWD"
   paseo plugin ls
   ```

   Confirm `worktrunk-worktree-location-support` reports `running`. After source edits, run
   `paseo plugin reload worktrunk-worktree-location-support`. Config edits need no reload.

## Behavior and security

- Only the new worktree destination changes; other request fields are preserved.
- Applies daemon-wide to new worktrees from the app, CLI, MCP, and agent creation.
- Paseo validates the destination and creates directories.
- Existing plugin-chosen destinations fail without suffixing or overwriting.
- Existing worktrees are not moved; restoration uses recorded paths.
- Git may choose a unique branch name after the hook; the path retains the requested name.

⚠️ Plugins are trusted, unsandboxed code with the daemon user's access. This plugin
reads your Worktrunk config but does not edit it or change Git ignore rules.
Ignore nested worktree directories before creating them to prevent accidental commits.

## Disable

```bash
paseo plugin disable worktrunk-worktree-location-support
paseo plugin ls
```

Disabling leaves existing worktrees in place and restores Paseo's normal placement.

## References

- [Worktrunk configuration](https://worktrunk.dev/config/#worktree-path-template)
- [Paseo worktree hook](https://paseo.sh/docs/plugins/hooks#worktreecreatebefore)

## License

MIT. See [LICENSE](./LICENSE).
