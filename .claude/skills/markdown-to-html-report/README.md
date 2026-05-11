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

## When the AI agent should NOT use it

- The user wants a real multi-page static site.
- The user wants a slide deck or PDF.
- The platform already renders the markdown well (GitHub, Notion) and the user doesn't want a standalone copy.

## Output naming convention

By default, mirror the source markdown's basename:

- `report.md` → `report.html`

Or place under `reports/` when generating several companion artifacts.

## Hard rules

1. Single file.
2. No network dependencies (no CDNs, remote fonts, or remote images).
3. Both themes hand-tuned, not auto-inverted.
4. No FOUC — early head-script applies the theme before paint.
5. Toggle is a real `<button>` with an `aria-label`.
6. Semantic markup; no div-soup.
7. Do not invent facts not in the source markdown.
