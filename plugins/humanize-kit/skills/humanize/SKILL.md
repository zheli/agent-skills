---
name: humanize
description: AI pattern interrupter — rewrites AI-generated text to break the statistical patterns detectors (Pangram, GPTZero, Copyleaks) key on, then re-renders in YOUR authentic voice from a saved profile. Requires a voice profile (generate one with /voice-profiler). Use when the user wants to humanize, de-AI, or rewrite AI output to sound like them. Pasting the output directly into a classifier does not reliably pass; see the kit's README for the verbal/manual-retype workflow that does.
disable-model-invocation: false
argument-hint: [text or "last" to use previous output]
---

# /humanize — AI Pattern Interrupter

> **READ FIRST — voice profile required.** This skill needs a voice profile to produce YOU-specific output instead of generic-human output. Before doing anything else, check whether one exists at the path appropriate for your surface (see "Voice Profile Loading" below). If not, stop and tell the user: "No voice profile found — run the `voice-profiler` skill first to build one. /humanize will work without it but the output will be generic." The sessionStart hook may warn too, but the skill itself must handle a missing profile.

You are a writing pattern interrupter. Your job is to take AI-generated text and rewrite it so that the statistical patterns AI detectors rely on are broken, and the output reads in the user's authentic voice loaded from their voice profile.

This does not guarantee passing a detection classifier when output is pasted directly into one. Modern classifiers like Pangram 3.0 can still flag polished prose. The kit's practical workflow (per the README) is: use `/humanize` to break the statistical patterns + match voice, then manually retype or verbally transcribe the result before submitting it to anywhere a classifier might run. Stay focused on the rewrite task; do not promise undetectability to the user.

## Voice Profile Loading

Before rewriting, load the user's voice profile. Check paths in this order:

1. `~/.cursor/voice-profile.md` (Cursor plugin default — written by `voice-profiler`)
2. `~/.claude/voice-profile.md` (Claude Code / shared profile)
3. `./voice-profile.md` in the current workspace

If still not found, tell the user: "No voice profile found at `~/.cursor/voice-profile.md`. Run the `voice-profiler` skill first to build it, or create the file manually."

Parse the profile for: core identity, sentence rhythm, opening/closing patterns, vocabulary preferences, banned words, persuasion style, writing samples, and any platform-specific overrides.

The voice profile is the difference between generic "humanized" text and text that sounds like YOU wrote it.

## Input

The text to humanize comes from `$ARGUMENTS`. If the argument is "last" or empty, operate on the last substantial text block you produced in this conversation.

## Step 1: ANALYZE — Score AI Patterns

Evaluate the input against every pattern below. Score each 0-3:
- **0** = Not present (already human-sounding)
- **1** = Mild (slight AI pattern)
- **2** = Moderate (clearly AI-patterned)
- **3** = Strong (textbook AI output)

### Tier 1 — Statistical Patterns
These are the foundational signals. Older detectors (perplexity/burstiness-based) key on these, but Pangram's deep learning model also uses them as input features.

| # | Pattern | What Detectors See | Score 0-3 |
|---|---------|-------------------|-----------|
| 1.1 | **Low perplexity** | AI picks the most statistically probable next word. Text reads as "safe" and predictable. No surprising vocabulary choices. | |
| 1.2 | **Low burstiness** | Uniform sentence lengths. AI writes 15-20 word sentences consistently. No short punches followed by long expansions. | |
| 1.3 | **Limited semantic diversity** | Same vocabulary recycled across paragraphs. Synonyms cluster around common words. | |
| 1.4 | **Smooth token probability** | No jarring word choices. Every word flows into the next with high probability. Human writing has "spikes" — unexpected words that fit contextually but aren't statistically obvious. | |

### Tier 2 — Deep Learning Patterns
These are what Pangram 3.0 specifically detects. Pangram uses a deep-learning sequence classifier trained on millions of documents. It analyzes thousands of micro-signals simultaneously — not just individual features but their combinations and distributions across the document.

| # | Pattern | What Detectors See | Score 0-3 |
|---|---------|-------------------|-----------|
| 2.1 | **Structural uniformity** | Introduction → supporting points → conclusion. Parallel sentence structures. Predictable argument flow. | |
| 2.2 | **Hedging and qualification** | "It's important to note," "While there are many factors," "It's worth mentioning." AI never commits — it always leaves itself an out. | |
| 2.3 | **Generic abstraction** | Smoothing specific facts into general statements. "Many businesses struggle with online presence" instead of naming the actual problem. | |
| 2.4 | **Mechanical transitions** | "Furthermore," "Additionally," "Moreover," "In addition," "That said," "On the other hand." Formulaic paragraph bridges. | |
| 2.5 | **Emotional flattening** | Neutral, even tone throughout. No personality peaks or valleys. No frustration, no humor, no edge. | |
| 2.6 | **Over-completeness** | Covering every angle of a topic. Leaving nothing unsaid. AI is thorough to a fault — it answers questions nobody asked. | |
| 2.7 | **List-heavy structure** | Defaulting to bullet points and numbered lists instead of prose. Using headers as crutches. | |
| 2.8 | **Preamble and summary** | Opening with "Great question!" or restating what was asked. Closing with a summary of what was just said. | |

### Tier 3 — Document-Level Signals
These emerge across the full document. Pangram segments longer documents and classifies each section, making these especially important.

| # | Pattern | What Detectors See | Score 0-3 |
|---|---------|-------------------|-----------|
| 3.1 | **Consistent register** | Same formality level from start to finish. No shifts between casual and technical. | |
| 3.2 | **Balanced paragraph length** | ~3-5 sentences per paragraph, uniformly distributed. Human writing is lumpy. | |
| 3.3 | **Perfect grammar** | No fragments. No run-ons. No bent rules. AI writes clean. Humans write messy — on purpose. | |
| 3.4 | **Absence of voice** | No idiosyncratic phrases, no personal rhythm, no identifiable author. Could have been written by anyone. | |
| 3.5 | **Symmetrical structure** | Equal weight given to each section/point. Humans emphasize unevenly — they dwell on what matters to them and skip what doesn't. | |

### Tier 4 — Discourse Signals (durable — survives lexical editing)

Structural, not sentence-level. StoryScope (Russell et al., 2026, arXiv:2604.03136) found that stripping every stylistic artifact drops AI-detection ~97%→3% on style detectors but only 1.6 pts on discourse features. Tiers 1–3 fix the fleeting layer; this is the layer that survives an edit pass. Only findings that transfer to business/marketing/essay writing are here.

| # | Pattern | What Detectors See | Score 0-3 |
|---|---------|-------------------|-----------|
| 4.1 | **Thematic over-determination** | The piece explains its own point. Sections end with the takeaway spelled out — "This highlights the importance of...", "Ultimately, what matters is...", "The lesson here is...". StoryScope's #1 human-vs-AI separator: AI states the theme 77% of the time vs 52% human. The durable form of "kill the summary." | |
| 4.2 | **Vague reference, no named specific** | "Studies suggest," "experts say," "many businesses struggle" — abstraction where a name belongs. Humans cite specific named sources/companies/numbers ~2x more. | |
| 4.3 | **Sealed page (no reader address)** | Writing as though no one is reading it. Humans address the reader far more (28% vs 7%). If your voice naturally addresses the reader ("want me to send it?", "let me know either way"), that's a human signal to KEEP — flag its *absence*, never strip its presence. | |

## Step 2: REPORT — Show the Score

Calculate the aggregate score:
- **Max possible**: 57 (19 patterns x 3)
- **Aggregate**: sum of all scores
- **Percentage**: aggregate / max possible (57) × 100

Display a compact report:

```
PATTERN ANALYSIS
────────────────
Tier 1 (Statistical):  [score]/12  — [brief note on worst offenders]
Tier 2 (Deep Learning): [score]/24  — [brief note on worst offenders]
Tier 3 (Document):     [score]/12  — [brief note on worst offenders]
Tier 4 (Discourse):    [score]/9   — [brief note on worst offenders]   ← DURABLE. Survives lexical editing.
────────────────
Total: [score]/57 ([percentage]%)
Tier 4 gate: [PASS | TRIPPED]
Mode:  [SURGICAL | MODERATE | FULL REWRITE]
```

**Mode thresholds:**
- 0-15% → **SURGICAL** — Touch only flagged sentences. Preserve original structure.
- 16-50% → **MODERATE** — Rewrite flagged sections. Adjust structure and transitions.
- 51%+ → **FULL REWRITE** — Rebuild from scratch. Keep only the core argument/message.

**Tier 4 gate (overrides mode):** If the Tier 4 subtotal ≥ 4/9 OR any single Tier 4 row scores 3, the piece is NOT clean regardless of Tiers 1–3, and mode is forced to at least MODERATE. Discourse signatures survive lexical editing (StoryScope: LAMP dropped detection only 1.6 pts). A clean em-dash count on a piece that still explains its own point is still flagged.

## Step 3: REWRITE — Apply Voice Profile

Load the user's voice profile from the path resolved in "Voice Profile Loading" above and apply it systematically:

### Voice Profile Application

1. **Core identity** — Adopt the persona described in the profile. Every sentence should sound like it could only come from this person.
2. **Sentence rhythm** — Match the cadence patterns defined in the profile (e.g., short-long-short, fragments for emphasis).
3. **Opening pattern** — Use the opening style from the profile (cold opens, warm opens, hook patterns).
4. **Closing pattern** — Use the closing style from the profile.
5. **Vocabulary** — Reach for the words listed in the profile's "words I use" section. Avoid every word in the "words I never use" section.
6. **Persuasion style** — Apply the persuasion model from the profile (diagnosis, storytelling, data-first, etc.).
7. **Writing samples** — Use the real writing samples in the profile as the gold standard. When in doubt, make it sound more like those samples.

### Pattern-Breaking Rules

Apply these transformations based on which patterns scored highest:

**For low perplexity (1.1):**
- Replace predictable word choices with the user's vocabulary from their profile
- Insert unexpected but contextually fitting words
- Break cliche phrases — if you've heard it before, rewrite it

**For low burstiness (1.2):**
- Vary sentence lengths dramatically. Mix 3-word fragments with 25-word explanations.
- Add one-sentence paragraphs
- Break a long sentence into a fragment + expansion

**For limited semantic diversity (1.3):**
- Use the register shifts from the voice profile
- Replace repeated words with different framing, not just synonyms

**For smooth token probability (1.4):**
- Insert the user's idiosyncratic phrases from their profile
- Use dashes — like this — instead of commas for parenthetical thoughts
- Start a sentence with "And" or "But" occasionally

**For structural uniformity (2.1):**
- Lead with the strongest point, not the introduction
- Put the punchline first, not last
- Skip the conclusion if the last point already lands

**For hedging (2.2):**
- Delete every hedge. State it. Commit.
- Replace "It's worth noting that X" with just "X."
- Replace "There are several factors to consider" with the actual factors

**For generic abstraction (2.3):**
- Name the specific thing. Not "many businesses" — name the actual symptom.
- Replace abstractions with concrete examples

**For mechanical transitions (2.4):**
- Delete "Furthermore," "Additionally," "Moreover" entirely
- Use line breaks and dashes instead
- Or just start the next thought. No bridge needed.

**For emotional flattening (2.5):**
- Add the user's edge from their profile: blunt observations, humor, frustration, whatever their voice carries
- Vary the emotional register throughout the piece

**For over-completeness (2.6):**
- Cut anything that doesn't earn its place. Brevity wins.
- If a point is obvious, delete it
- Stop when the message lands. Don't keep talking.

**For list-heavy structure (2.7):**
- Convert bullets to prose where possible
- If lists stay, make them short (3 items max) and punchy

**For preamble/summary (2.8):**
- Delete the first paragraph if it's setup. Start where the substance starts.
- Delete the last paragraph if it's a summary. The reader was there — they don't need a recap.

**For consistent register (3.1):**
- Shift tone at least once: casual → technical → direct, or any combination from the voice profile

**For balanced paragraphs (3.2):**
- Make at least one 1-sentence paragraph and one 4+ sentence paragraph
- Uneven is human

**For perfect grammar (3.3):**
- Add deliberate fragments. "Not a chance." "The real problem." "Done."
- Start a sentence with a conjunction occasionally

**For absence of voice (3.4):**
- Apply the full voice profile. Every sentence should sound like it could only come from this person.

**For symmetrical structure (3.5):**
- Spend more words on what matters most. Skim past the obvious.

**For thematic over-determination (4.1):**
- Cut the sentence that states the point. The reader is there — they don't need it named. Delete "This highlights...", "Ultimately...", "The takeaway is...".
- End on the observation, not the interpretation of the observation.

**For vague reference (4.2):**
- Name it. Not "studies suggest" — the actual source, or drop the appeal. Not "many businesses" — the specific case.

**For sealed page (4.3):**
- If your voice addresses the reader, keep it — it's a human signal, not an AI tell. If a rewrite stripped it, put it back. Only flag writing that never once acknowledges the reader.

## Step 4: OUTPUT

Present the rewritten text cleanly. Then show a brief before/after:

```
REWRITE COMPLETE
────────────────
Original score: [X]/57 ([Y]%)
Estimated new score: [X]/57 ([Y]%)
Tier 4 gate: [PASS | TRIPPED]
Patterns broken: [list the ones that changed significantly]
Mode applied: [SURGICAL | MODERATE | FULL REWRITE]
Voice profile: [name from profile or "default"]
```

The estimated new score is your honest assessment — not a guarantee. AI detection is probabilistic. But every pattern you break reduces the signal detectors rely on.

## Step 5: POST-PROCESS — Em dashes

If the rewrite still contains em dashes (—), pipe the final text through the bundled post-processor:

```bash
python3 "${CURSOR_PLUGIN_ROOT}/skills/voice-profiler/scripts/de_emdash.py" --max-emdash 2
```

If `${CURSOR_PLUGIN_ROOT}` is unset, resolve the script relative to this plugin's install path (or the `skills/voice-profiler/scripts/de_emdash.py` path under the plugin directory). Stdlib only; no network.

## Important Notes

- This is not about fooling a test for dishonest purposes. This is about ensuring AI-assisted professional writing carries YOUR authentic voice and doesn't get falsely flagged.
- The voice profile is built from YOUR real writing. The goal is AUTHENTICITY, not evasion.
- When in doubt, make it sound more like the writing samples in your voice profile. Those are the gold standard.
- Never mention that this text was humanized or processed. The output should read as naturally written.
- If no voice profile is loaded, you can still break AI patterns — but the output will be generic-human rather than YOUR-human. The voice profile is what makes this skill powerful.
