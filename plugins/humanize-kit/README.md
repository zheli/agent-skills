# Humanize Kit

Cursor plugin packaging of [humanize-kit](https://github.com/Branded-Mayhem-Collective-LLC/humanize-kit) by [Branded Mayhem](https://brandedmayhem.com). Three agent skills analyze your real writing, build a voice fingerprint, then rewrite AI output to match it.

## Skills

| Skill | Purpose |
| --- | --- |
| `voice-profiler` | Interview + sample analysis → `~/.cursor/voice-profile.md` |
| `humanize` | Score 23 AI patterns, rewrite in your voice, strip excess em dashes |
| `humanize-ig` | Instagram mode: lowercase, dense block, imperfect phone-typed energy |

## Install

### Customize (recommended)

1. Open **Customize** in the Cursor sidebar.
2. Open the **Plugins** tab.
3. Add marketplace repo `https://github.com/zheli/agent-skills`.
4. Install **Humanize Kit** (user or project scope).

### Local symlink (plugin development)

```bash
mkdir -p ~/.cursor/plugins/local
ln -s /absolute/path/to/agent-skills/plugins/humanize-kit ~/.cursor/plugins/local/humanize-kit
```

Then run **Developer: Reload Window**.

## First-time setup

1. Run the **voice-profiler** skill and paste 3–5 samples of writing you are proud of.
2. Confirm the profile landed at `~/.cursor/voice-profile.md` (Claude Code profiles at `~/.claude/voice-profile.md` are also loaded).
3. Run **humanize** or **humanize-ig** on AI-generated text.

A `sessionStart` hook warns when no voice profile is found; it does not block the session.

## Voice profile lookup order

1. `~/.cursor/voice-profile.md`
2. `~/.claude/voice-profile.md`
3. `./voice-profile.md`

## Em dash post-processor

After a rewrite, skills may run:

```bash
python3 "${CURSOR_PLUGIN_ROOT}/skills/voice-profiler/scripts/de_emdash.py" --max-emdash 2
```

(`python3` on `PATH`; stdlib only.)

## Detector workflow note

Pasting humanized output straight into Pangram / GPTZero / similar tools does **not** reliably pass. Treat this kit as a voice-consistency assistant. When classifier scores matter, retype or dictate the result before submitting. See the [upstream README](https://github.com/Branded-Mayhem-Collective-LLC/humanize-kit#workflow-notes--what-actually-passes-a-detector).

## Upstream

- Source kit: https://github.com/Branded-Mayhem-Collective-LLC/humanize-kit
- Branded Mayhem: https://brandedmayhem.com

## License

MIT. Upstream copyright Branded Mayhem Collective LLC; Cursor packaging in this repo. See [LICENSE](./LICENSE).
