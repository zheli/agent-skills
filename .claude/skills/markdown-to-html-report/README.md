# markdown-to-html-report

An AI agent skill that generates a self-contained, human-friendly companion HTML report from a markdown AI-agent response (or any markdown document).

## What it produces

A single `.html` file with:

- **No external dependencies** — all CSS, JS, and content inline. Works offline; safe to email or attach.
- **Light/dark mode toggle** in the top-right corner.
  - Defaults to the OS `prefers-color-scheme` on first visit.
  - Persists the user's choice in `localStorage` (`mdReportTheme`).
  - Applies the saved theme before first paint, so there's no flash.
  - Live-tracks OS theme changes until the user makes an explicit choice.
- **Content-appropriate layout** — the skill picks a pattern (explainer, decision doc, review feedback, comparison, status report, reference) instead of dumping markdown 1:1.
- **Reusable components** — TL;DR box, good/warn panels, excerpt blocks, numbered action lists, tradeoff tables, pills, semantic blockquotes, accessible theme button.
- **Responsive and print-friendly** down to ~360px wide.
- **Optional GitHub Pages publishing** — copy the finished report into a Pages repository, cloning it first when the user chooses that workflow.
- **Optional password protection** — wrap the report in a self-contained AES-GCM encrypted HTML page that decrypts in the browser.

## Files

- `SKILL.md` — the skill instructions the AI agent loads.
- `template.html` — the baseline HTML file. Copy and customize this for each report.
- `README.md` — this file.

## When the AI agent should use it

User asks for any of:

- "Create an HTML report / page / explainer for this"
- "Make this markdown easier to read"
- "Generate a companion HTML for my answer"
- "Render this as a webpage"
- "Publish this report to GitHub Pages"
- "Make this page password protected"

## When the AI agent should NOT use it

- The user wants a real multi-page static site.
- The user wants a PDF.
- The platform already renders the markdown well (GitHub, Notion) and the user doesn't want a standalone copy.

## Reference examples

See **https://thariqs.github.io/html-effectiveness/** for 20 live self-contained HTML files an AI agent produced — covering exploration grids, code review diffs, design systems, prototypes, SVG diagrams, slide decks, reports, and custom editors. Use it as a benchmark for layout ambition.

## Output naming convention

By default, mirror the source markdown's basename:

- `report.md` → `report.html`

Or place under `reports/` when generating several companion artifacts.

## GitHub Pages publishing

When the user wants to publish the generated page, the skill can guide the agent to:

- Ask whether to keep the file local, publish to an existing local Pages repository, clone a Pages repository first, or publish an encrypted wrapper.
- Request the GitHub Pages repository URL or `owner/repo` only when it is not obvious.
- Check whether the Pages repository is already cloned locally.
- Offer to clone the repository if it is missing from the local computer.
- Confirm the target path, such as `reports/report.html` or `index.html`, before overwriting files.
- Copy the generated self-contained HTML file into the Pages repository.
- Commit and push the Pages repository change only after the user chooses publishing.

The generated HTML remains a single file with no external dependencies. The skill does not introduce a static site generator unless the user explicitly asks for one.

## Password-protected pages

When the user asks for password protection, the skill creates the normal report first, then wraps it in an encrypted HTML page.

The encrypted wrapper uses:

- Browser-native Web Crypto API.
- `PBKDF2` key derivation with a per-page random salt.
- `AES-GCM` encryption with a per-page random IV.
- Embedded ciphertext and non-secret encryption metadata.
- An in-browser password prompt that decrypts and renders the report after unlock.

Security notes:

- The password is never stored in the generated file.
- The wrapper protects report content at rest in a public repository when the password is strong and private.
- It does not hide repository history, filenames, file size, or wrapper metadata.
- It cannot revoke access for users who already have both the file and password.
- If plaintext was previously published or committed, encryption does not remove it from Git history or caches.

## Hard rules

1. Single file.
2. No network dependencies (no CDNs, remote fonts, or remote images).
3. Both themes hand-tuned, not auto-inverted.
4. No FOUC — early head-script applies the theme before paint.
5. Toggle is a real `<button>` with an `aria-label`.
6. Semantic markup; no div-soup.
7. Do not invent facts not in the source markdown.
8. Publishing is opt-in; do not clone, commit, or push a Pages repository unless the user chooses it.
9. Passwords are secrets; never echo, log, commit, or include them in PRs, issues, shell history, or generated docs.
