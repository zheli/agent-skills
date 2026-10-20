---
name: markdown-to-html-report
description: Generate a self-contained, human-friendly companion HTML report from a markdown AI-agent response (or any markdown document). The output is a single .html file with no external dependencies, an explicit light/dark mode toggle (with OS-preference default and persistence), and a layout chosen to fit the content type (explainer, comparison, decision doc, review feedback, status report, etc.).
allowed-tools: [Read, Write, Edit, Glob, Grep, Bash]
---

# Markdown to HTML Report

## Purpose

Turn a markdown answer or document into a polished, **self-contained HTML page** that is easier for humans to read and skim than raw markdown. The HTML report is a "companion" artifact: the markdown remains the source of truth; the HTML is for review, sharing, and presentation.

The skill produces:

- A **single `.html` file** with no external CSS, JS, fonts, or image dependencies (works offline; safe to email/attach).
- A **light/dark mode toggle** in the top-right that respects `prefers-color-scheme` on first load and persists the user's choice in `localStorage`.
- A **layout chosen to match the content** — not a one-size-fits-all dump.
- Optional **GitHub Pages publishing** when the user wants the generated page deployed to a Pages repository.
- Optional **password-protected encrypted output** using browser-native AES-GCM when the page will be stored in a public or semi-public location.

## Reference

**https://thariqs.github.io/html-effectiveness/** — a curated gallery of 20 self-contained HTML files an AI agent produced across nine categories (exploration, code review, design, prototyping, diagrams, decks, research, reports, custom editors). Use it as inspiration for layout ambition and component variety. Every entry is itself a single `.html` file with no external dependencies.

## When to Use This Skill

Use this skill when the user asks for any of:

- "Create an HTML report / page / explainer for this"
- "Make this markdown easier to read"
- "Generate a companion HTML for my answer"
- "Render this as a webpage"
- "Publish this report to GitHub Pages"
- "Make the HTML page password protected"
- A polished review/decision/explainer/diagram/deck artifact derived from markdown content

Do **not** use this skill when:

- The user wants a real static site / multi-page docs (use a static site generator).
- The markdown is going to be rendered by a platform that already handles it (GitHub, Notion, etc.) — unless they explicitly want a standalone HTML copy.

## Workflow

### Step 1 — Read the source markdown

Always `Read` the full source markdown first. Identify:

1. **Content type** (see "Layout patterns" below). Common types:
   - Explainer / single-topic deep-dive
   - Decision doc / recommendation
   - Review or feedback response
   - Comparison / tradeoff analysis
   - Status report / progress update
   - Reference / cheat-sheet
2. **Structural anchors**: headings, lists, code blocks, tables, quotes, callouts.
3. **The reader's job**: are they skimming for a decision, looking up a fact, or reading end-to-end?

If the content type is ambiguous, ask the user once before generating.

### Step 2 — Choose a layout pattern

Pick the layout that helps the human most. Combine patterns when useful. Aim for the ambition level shown at **https://thariqs.github.io/html-effectiveness/** — plain prose dumps are the floor, not the target.

| Content type | Layout signals to include |
|---|---|
| Explainer / deep-dive | TL;DR box at top, numbered sections, generous whitespace, collapsible details, footnotes/sources at bottom |
| Decision / recommendation | Headline recommendation panel, action steps as numbered cards, tradeoff table |
| Review / feedback | Quoted reviewer text in a left-bordered blockquote, excerpt panels for original text, recommendation panel, open-questions warn panel |
| Comparison / tradeoff | Side-by-side or full-width tradeoff table, summary verdict box |
| Exploration / options | Card grid showing each option side-by-side with trade-offs called out inline |
| Status report | Status pill in header, milestone/checklist table, small inline chart, risks panel |
| Incident / post-mortem | Minute-by-minute timeline, log excerpt panels, follow-up checklist |
| Code review / PR | Annotated diff with margin notes, severity tags, module map (boxes and arrows), jump links |
| Diagram / flowchart | Inline SVG flowchart or architecture diagram with labeled nodes and annotated paths |
| Slide deck | `<section>`-per-slide layout with arrow-key JS navigation (left/right), no external deps |
| Reference / cheat-sheet | Sticky table of contents, dense tables, anchored headings |

Common reusable components (all in `template.html`):

- **TL;DR / headline box** — accent-tinted panel at the top.
- **Panels**: neutral (`.panel`), good (`.panel.good`), warn (`.panel.warn`).
- **Excerpt panel** — small label + monospace block, for quoting source material.
- **Pill** — small uppercase badge next to a title (e.g. status, sentiment, theme).
- **Numbered action list** — `ol.actions` with circled numerals for "do this, then this".
- **Tradeoff / comparison table** — 2- or 3-column comparison.
- **Card grid** — CSS `grid` with `auto-fill` columns; each card has a thumbnail area, title, and description.
- **Inline SVG diagrams** — boxes, arrows, flowcharts drawn directly in the HTML; no external image files.
- **Footer** — links back to source files and a "this is a companion artifact" note.

When the content genuinely benefits, add lightweight interactivity (collapsible sections, tab switchers, arrow-key navigation for decks). Keep JS self-contained and minimal — no frameworks.

### Step 3 — Generate the HTML

Use the template in `template.html` (next to this file) as the baseline. It already contains:

- `<!DOCTYPE html>` and proper `<head>` with viewport meta and title.
- Embedded CSS using CSS custom properties for both light and dark palettes.
- A working **theme toggle button** that:
  - Defaults to `prefers-color-scheme` on first visit.
  - Toggles `data-theme="light"` / `data-theme="dark"` on `<html>`.
  - Persists the chosen theme in `localStorage` under key `mdReportTheme`.
  - Inlines an early script in `<head>` to apply the saved theme before paint (no FOUC).
- All component classes referenced above (`.panel`, `.tldr`, `.pill`, `ol.actions`, `.excerpt-label`, `blockquote.review`, tables, code blocks).
- Print-friendly defaults.

Customize the template by:

1. Setting `<title>` and the header (`h1`, subtitle, pills, metadata row).
2. Filling the body with the chosen layout pattern.
3. Removing component blocks you do not use — keep the CSS for them (it is cheap) but do not leave unused HTML scaffolding.
4. Adding source/footer links that point back to the original markdown file(s).

### Step 4 — Decide on the output location and filename

Default naming: alongside the source markdown, mirror the basename.

- Source: `report.md` → `report.html` (or in repo root if explicitly requested).
- If multiple HTML reports may be generated, place them in `reports/` or another folder the user names.

Ask the user if the location/filename is not obvious.

### Step 5 — Write the file and confirm

- Use the `Write` tool with the full HTML contents (template + customization).
- Do **not** rely on external CSS, JS, fonts, CDNs, or images. Inline anything required.
- After writing, briefly tell the user the layout pattern you chose and output the file as a clickable markdown link using the format `[filename.html](file:///absolute/path/to/filename.html)` so the user can open it directly with a single click. For example: `[report.html](file:///Users/me/project/report.html)`.

### Step 6 — Offer publishing and protection options

After the local HTML file exists, offer follow-up choices when the user has not already specified a destination:

1. Keep the HTML file local only.
2. Publish the HTML file to an existing local GitHub Pages repository.
3. Clone a GitHub Pages repository, then publish the HTML file there.
4. Create a password-protected encrypted page before publishing or sharing.

Ask only for the missing information needed to proceed:

- GitHub Pages repository URL or `owner/repo`.
- Local clone path, if the user already has one.
- Target path inside the Pages repository, such as `reports/report.html` or `index.html`.
- Whether to publish the plain HTML file or the encrypted wrapper.

If a likely local Pages repository is not obvious, search nearby workspaces with `Glob` or ask the user for the path. If the repository is not cloned locally, offer to clone it before publishing. Do not clone, commit, or push without the user's explicit choice.

### Step 7 — Publish to GitHub Pages when requested

When the user chooses GitHub Pages publishing:

1. Verify the target repository is a Git repository and check `git status --short --branch` before changing it.
2. Confirm the Pages target path if overwriting an existing file.
3. Copy the generated `.html` file into the requested path in the Pages repository.
4. If the Pages repository uses a build step, run only the documented build or preview command for that repository. Do not add a static site generator for a single self-contained page unless the user asks.
5. Run a lightweight verification, such as checking that the target file exists and contains `<!DOCTYPE html>`.
6. Commit the Pages repository change with a Conventional Commit, for example `docs: publish html report`.
7. Push only after the user selected publishing. If the target branch is `main` or `master`, ask before pushing unless the user already asked for a push.

Keep the source repository and Pages repository changes separate. Do not mix commits across repositories.

### Step 8 — Create a password-protected encrypted page when requested

Use encrypted output when the user wants the HTML page to be password protected, especially before publishing to a public GitHub Pages repository.

Implementation requirements:

1. Generate the normal self-contained HTML report first.
2. Wrap the report in a second self-contained HTML file with a password form, browser-native Web Crypto API code, `PBKDF2` key derivation, `AES-GCM` decryption, and embedded ciphertext plus non-secret encryption metadata.
3. Keep the password out of the generated file. Store only the encrypted payload and non-secret encryption metadata.
4. Use a strong KDF iteration count appropriate for browser use, such as 250,000 or higher, unless performance testing shows it is too slow for the target readers.
5. Decrypt entirely in the browser after the user enters the password, then replace the document body with the decrypted report.
6. Preserve the no-network-dependency requirement. The encrypted wrapper must not load external scripts, styles, fonts, or images.
7. Test with the intended password locally before publishing, but never print or persist the password in logs, commit messages, PR text, issue text, or shell history.

Security limitations to explain to the user:

- This protects the report content at rest in a public repository if the password is strong and kept private.
- It does not hide the existence of the page, repository history, filename, file size, or any metadata left in the unencrypted wrapper.
- It cannot revoke access for anyone who already has the HTML file and password.
- If the plaintext report was previously committed or published, encrypting a later version does not remove the old plaintext from Git history or caches.

## Hard Requirements

1. **Single file.** Everything (CSS, JS, content) inline in one `.html` file.
2. **No network dependencies.** No `<link rel="stylesheet">` to remote URLs, no `<script src>` to CDNs, no remote fonts, no remote images. The file must render identically offline.
3. **Both themes are first-class.** Both light and dark palettes must be hand-tuned — not auto-inverted. Verify contrast for: body text, muted text, code blocks, every panel variant, pill, table headers, accent foreground on accent background, and the toggle button itself.
4. **No FOUC.** The early head-script must apply the saved/system theme before the body paints.
5. **Accessible toggle.** The theme toggle must be a real `<button>` with an `aria-label` reflecting the action (e.g. `Switch to dark mode`).
6. **Semantic markup.** Use real `<h1>`–`<h3>`, `<ol>`, `<ul>`, `<table>`, `<blockquote>`, `<code>`/`<pre>`. Do not emit div-soup.
7. **Responsive.** Works down to ~360px wide. Tables can scroll horizontally on narrow screens.
8. **No emojis** unless the source markdown explicitly contains them or the user asks.
9. **Preserve source meaning.** Do not invent facts not in the markdown. Compress prose where helpful, but never add new claims, numbers, or quotes.
10. **Publishing is opt-in.** Do not clone, commit to, or push a GitHub Pages repository unless the user chooses that workflow.
11. **Passwords are secrets.** Never echo, log, commit, or include a page password in generated documentation, PR text, shell history, or comments.

## Recommended Visual System

Use this palette as the default (the template already encodes it). Override only with user request.

**Light**
- `--bg: #ffffff`, `--fg: #1f2328`, `--muted: #57606a`
- `--panel: #f6f8fa`, `--border: #d0d7de`, `--code-bg: #f6f8fa`
- `--accent: #0969da`, `--accent-soft: #ddf4ff`
- `--good: #1a7f37`, `--good-soft: #dafbe1`
- `--warn: #9a6700`, `--warn-soft: #fff8c5`

**Dark**
- `--bg: #0d1117`, `--fg: #e6edf3`, `--muted: #9198a1`
- `--panel: #161b22`, `--border: #30363d`, `--code-bg: #161b22`
- `--accent: #4493f8`, `--accent-soft: #0c2d6b`
- `--good: #3fb950`, `--good-soft: #0f2f1a`
- `--warn: #e3b341`, `--warn-soft: #3a2c00`

System font stack: `-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`. Monospace: `ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace`. Max content width ~880px, generous line-height (~1.6).

## Examples

See **https://thariqs.github.io/html-effectiveness/** for 20 live examples across all content types below.

### Example 1 — Review feedback
Source: `report.md` (multi-comment reviewer feedback).
Pattern: blockquote for reviewer text → excerpt panels for original proposal lines → recommendation panel → tradeoff table → numbered action list → open-questions warn panel.
Output: `report.html` in the same directory or repo root.

### Example 2 — Decision document
Source: a markdown weighing two architectural options.
Pattern: TL;DR with chosen option highlighted → side-by-side tradeoff table → numbered action list for implementation → risks panel.

### Example 3 — Status update
Source: a markdown progress report.
Pattern: status pill in header → milestone table with status column → small inline bar chart → risks/blockers warn panel → next steps numbered list.

### Example 4 — Exploration / options comparison
Source: a markdown listing three implementation approaches.
Pattern: card grid (one card per option) with trade-offs called out inline → summary verdict box.

### Example 5 — Slide deck
Source: a markdown outline for a presentation.
Pattern: one `<section>` per slide, arrow-key JS navigation, slide counter pill, no external deps.

### Example 6 — GitHub Pages report
Source: `report.md`.
Pattern: generate `report.html`, then ask whether to copy it to an existing Pages repository or clone `owner/repo` first.
Output: `reports/report.html` committed and pushed in the Pages repository after user confirmation.

### Example 7 — Password-protected Pages report
Source: `private-review.md`.
Pattern: generate the normal report, encrypt the complete HTML payload with AES-GCM, and publish only the encrypted wrapper to GitHub Pages.
Output: a standalone password prompt page that decrypts the report in-browser with no network dependencies.

## Anti-patterns to Avoid

- Dumping the markdown 1:1 into HTML with no structural choices.
- Stopping at "document" layouts when a card grid, diagram, or deck would serve the content better.
- Loading Tailwind, Bootstrap, highlight.js, or any framework via CDN.
- Using emojis as section icons.
- Embedding base64 fonts/images unless the user asked for offline parity with a branded asset.
- Making dark mode a CSS `filter: invert()` hack.
- Forgetting the early theme-application script (causes a flash on load).
- Publishing plaintext to GitHub Pages when the user requested password protection.
- Treating client-side password protection as access control for weak or reused passwords.
