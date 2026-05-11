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

## When to Use This Skill

Use this skill when the user asks for any of:

- "Create an HTML report / page / explainer for this"
- "Make this markdown easier to read"
- "Generate a companion HTML for my answer"
- "Render this as a webpage"
- A polished review/decision/explainer artifact derived from markdown content

Do **not** use this skill when:

- The user wants a real static site / multi-page docs (use a static site generator).
- The user wants a slide deck, PDF, or print-only output.
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

Pick the layout that helps the human most. Combine patterns when useful.

| Content type | Layout signals to include |
|---|---|
| Explainer / deep-dive | TL;DR box at top, numbered sections, generous whitespace, footnotes/sources at bottom |
| Decision / recommendation | Headline recommendation panel, action steps as numbered cards, tradeoff table |
| Review feedback response | Quoted reviewer text in a left-bordered blockquote, "what was originally proposed" excerpt panels, "recommendation" panel, open-questions warn panel |
| Comparison / tradeoff | Side-by-side or full-width tradeoff table, summary verdict box |
| Status report | Status pill in header, milestone/checklist table, risks panel |
| Reference | Sticky table of contents (optional), dense tables, anchored headings |

Common reusable components:

- **TL;DR / headline box** — accent-tinted panel at the top.
- **Panels**: neutral (`.panel`), good (`.panel.good`), warn (`.panel.warn`).
- **Excerpt panel** — small label + monospace block, for quoting source material.
- **Pill** — small uppercase badge next to a title (e.g. status, sentiment, theme).
- **Numbered action list** — `ol.actions` with circled numerals for "do this, then this".
- **Tradeoff table** — 2- or 3-column comparison.
- **Footer** — links back to source files and a "this is a companion artifact" note.

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
- After writing, briefly tell the user the file path and the layout pattern you chose.

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

### Example 1 — Review feedback explainer
Source: `report.md` (multi-comment reviewer feedback).
Pattern: blockquote for reviewer text → excerpt panels for original proposal lines → recommendation panel → tradeoff table → numbered action list → open-questions warn panel.
Output: `report.html` in the same directory or repo root.

### Example 2 — Decision document
Source: a markdown weighing two architectural options.
Pattern: TL;DR with chosen option highlighted → side-by-side tradeoff table → numbered action list for implementation → risks panel.

### Example 3 — Status update
Source: a markdown progress report.
Pattern: status pill in header → milestone table with status column → risks/blockers warn panel → next steps numbered list.

## Anti-patterns to Avoid

- Dumping the markdown 1:1 into HTML with no structural choices.
- Loading Tailwind, Bootstrap, highlight.js, or any framework via CDN.
- Using emojis as section icons.
- Embedding base64 fonts/images unless the user asked for offline parity with a branded asset.
- Adding interactivity (search, filters, collapsible sections) unless the content genuinely benefits — most reports don't.
- Making dark mode a CSS `filter: invert()` hack.
- Forgetting the early theme-application script (causes a flash on load).
