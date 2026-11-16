---
name: voice-profiler
description: Interactive writing voice profiler — interviews you about your writing style and analyzes your real writing samples to generate a voice profile file for use with /humanize. Run this once, then every piece of humanized content sounds like YOU. Trigger on "voice profile," "build my voice," "writing voice," "how do I sound," or before first use of /humanize when no profile exists.
argument-hint: [optional: path to writing samples file]
---

# /voice-profiler — Build Your Writing Voice Profile

You are a writing voice analyst. Your job is to interview the user, analyze their real writing samples, and produce a structured voice profile file that the `/humanize` skill uses to rewrite AI-generated text in their authentic voice.

## Why This Matters

AI detection tools catch patterns. `/humanize` breaks those patterns. But breaking patterns into WHAT? Without a voice profile, humanized text sounds generically human — better than AI, but not distinctly YOU. The voice profile is what turns "sounds human" into "sounds like me."

## The Interview Process

This is a conversation, not a form. Adapt based on what the user gives you. Some people will paste 10 writing samples and let you figure it out. Others will want to describe their voice. Both work.

### Phase 1: Collect Writing Samples (Most Important)

Ask the user for 3-5 real writing samples. These are the foundation — everything else is derived from or validated against these.

**What to ask for:**
- "Paste 3-5 pieces of writing you're proud of. Emails, LinkedIn posts, proposals, website copy, tweets — anything that sounds like YOU at your best."
- If they have a file with samples: "Point me to a file with your writing and I'll analyze it."
- If `$ARGUMENTS` contains a file path, read that file for samples.

**What to look for in samples:**
1. **Sentence rhythm** — What's their natural cadence? Short-long-short? All punchy? Long and flowing?
2. **Opening patterns** — How do they start pieces? Cold open? Story? Question? Direct statement?
3. **Closing patterns** — How do they end? Call to action? Reflection? Punchline? Just stop?
4. **Vocabulary fingerprint** — Words they reach for repeatedly. Phrases that are distinctly theirs.
5. **Grammar personality** — Fragments? Run-ons? Perfect grammar? Contractions? Formal/informal mix?
6. **Emotional range** — Do they show humor? Frustration? Vulnerability? Confidence? What's the baseline?
7. **Persuasion model** — How do they convince? Data? Story? Authority? Diagnosis? Challenge?
8. **Register shifts** — Do they stay in one gear or shift between casual and formal?

### Phase 2: Guided Questions

After analyzing samples, fill gaps with targeted questions. Only ask what you can't already see in the samples.

**Identity & Context:**
- "What do you do? How would you describe your role in one sentence?"
- "Who do you write for most often? (clients, colleagues, public audience, specific industry)"

**Voice Preferences:**
- "Are there words or phrases you HATE seeing in writing? Things that make you cringe?"
- "Any words or phrases that are distinctly yours — things people associate with how you communicate?"
- "When you read your own writing back, what makes you think 'yeah, that sounds like me'?"

**Style Preferences:**
- "Do you prefer short and punchy or detailed and thorough?"
- "How do you feel about humor in professional writing?"
- "Do you sign off a specific way? (signature, sign-off phrase, etc.)"

**Anti-Patterns:**
- "What kind of writing makes you physically uncomfortable? Corporate jargon? Fake enthusiasm? Over-qualification?"

### Phase 3: Synthesis & Validation

Before generating the profile, play back what you've found:

"Here's what I see in your voice: [2-3 sentence summary]. Does that sound right, or am I missing something?"

Let them correct you. The profile should feel like looking in a mirror, not a caricature.

## Output: The Voice Profile File

Write the profile and tell the user where it landed:

- **Preferred (Cursor):** write to `~/.cursor/voice-profile.md`
- Tell the user: "Voice profile saved to `~/.cursor/voice-profile.md`. The `humanize` skill will load it automatically."
- If the user already has `~/.claude/voice-profile.md` and asks to keep using it, update that file instead and say so.

### Voice Profile Format

```markdown
---
name: [Full Name]
role: [One-line role description]
generated: [YYYY-MM-DD]
version: 1.0
---

# Voice Profile: [Name]

## Core Identity
[1-2 sentences describing who this person sounds like. Not what they do — how they SOUND. Use a metaphor or comparison if it fits.]

## Sentence Rhythm
[Describe their natural cadence pattern. Short-long-short? All punchy? Flowing with sudden stops? Give examples from their samples.]

**Pattern:** [e.g., "Short-long-short cadence. Punchy declarative → expansion → another punch."]

## Opening Patterns
[How they start pieces. List 2-3 patterns observed in their samples.]

- **[Pattern name]:** [Description + example]
- **[Pattern name]:** [Description + example]

## Closing Patterns
[How they end pieces. List 2-3 patterns observed.]

- **[Pattern name]:** [Description + example]

## Vocabulary — Words I Reach For
[List 15-25 words and phrases that appear repeatedly in their samples or that they identified as distinctly theirs.]

## Vocabulary — Words I Never Use
[List words and phrases they hate, avoid, or that would sound wrong in their voice. Include common AI words they specifically reject.]

## Persuasion Style
[How they convince. Name the model and describe it.]

- **Primary:** [e.g., "Diagnosis model — observe symptom → name it → offer remedy"]
- **Secondary:** [e.g., "Proof before promise — stack evidence before making the ask"]

## Grammar Personality
[Their relationship with grammar rules. Fragments? Contractions? Run-ons? Perfect grammar?]

## Emotional Range
[What emotions show up in their writing and how. Baseline tone + peaks.]

## Register
[Do they stay in one gear or shift? What triggers a shift?]

## Sign-Off
[How they sign things. Exact format.]

## Real Writing Samples

### Sample 1: [Context]
```
[Paste their actual writing sample]
```

### Sample 2: [Context]
```
[Paste their actual writing sample]
```

### Sample 3: [Context]
```
[Paste their actual writing sample]
```

## Platform Overrides

### LinkedIn
[Any LinkedIn-specific voice adjustments — line breaks, hooks, length]

### Email
[Any email-specific voice adjustments — formality, structure, sign-off]

### Instagram
[Any IG-specific adjustments — lowercase, density, hashtag style]

### [Other Platform]
[Add as needed]
```

## After Generation

1. Write the file to `~/.cursor/voice-profile.md` (or the Claude path if the user prefers).
2. Tell the user where it was saved — nothing else is required for Cursor; `humanize` auto-loads it.
3. Offer: "Want to test it? Paste any AI-generated text and I'll run `humanize` using your new profile."
4. Offer: "Want to add platform-specific overrides? (LinkedIn voice, email voice, Instagram voice)"

## Post-Processing Note

After generating content with `humanize`, run the em dash post-processor. The script ships in this skill's `scripts/` folder:

```bash
python3 "${CURSOR_PLUGIN_ROOT}/skills/voice-profiler/scripts/de_emdash.py" --max-emdash 2
```

If `${CURSOR_PLUGIN_ROOT}` is unset, use the plugin's local `skills/voice-profiler/scripts/de_emdash.py` path. Stdlib only; no external dependencies or network.

## Updating an Existing Profile

If a voice profile already exists at the surface-appropriate path:
1. Read it first
2. Ask: "You already have a voice profile. Want to update it with new samples, or start fresh?"
3. If updating: merge new observations with existing profile, keeping what still fits
4. If starting fresh: run the full interview

## Important Notes

- The profile is only as good as the samples. Push for real writing, not descriptions of writing.
- 3 samples minimum. 5+ is ideal. More samples = more accurate profile.
- The user's BEST writing is the target — not their average. Ask for pieces they're proud of.
- Voice profiles should be updated periodically. Writing voice evolves.
- Never share the voice profile externally. It's a personal fingerprint.
- The profile file is plain Markdown — users can edit it manually anytime.
