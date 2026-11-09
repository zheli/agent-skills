# Worktrunk worktree location support

Use the global `worktree-path` from your Worktrunk user config for new Paseo
worktrees. Reads `$XDG_CONFIG_HOME/worktrunk/config.toml`, or
`~/.config/worktrunk/config.toml` when XDG_CONFIG_HOME is unset or empty, on
each creation. If the user file or setting is missing, checks
`<sourceCheckout>/.config/wt.toml` next. If neither supplies `worktree-path`,
Paseo's normal placement is unchanged. User settings take precedence.

Supports `{{ branch }}`, `{{ repo }}`, `{{ repo_path }}`, and the
`sanitize` filter, which replaces slashes and backslashes with hyphens.
Relative paths resolve from the main repository root, and leading `~/` expands
to the daemon user's home directory.

Requires Paseo 0.14.0-beta.1 or newer with plugins enabled. Invalid TOML, read
errors other than a missing file, or unsupported templates abort creation.
`[projects]` overrides, other Worktrunk variables and filters, and Worktrunk environment
overrides are not supported. Existing worktrees are not moved.

Ignore nested worktree directories in Git before using a template inside the
repository. Existing destinations fail rather than being overwritten.
