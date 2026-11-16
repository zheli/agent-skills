#!/usr/bin/env python3
"""
de_emdash.py — Post-processor for /humanize skill output.

Replaces em dashes with Michael's actual punctuation devices,
based on frequency analysis of 370+ iMessages (2025-2026):
  - space-hyphen-space ( - ): 27 instances (primary aside device)
  - parentheses: 20 instances (secondary aside device)
  - period + new sentence: common for hard breaks
  - comma/colon: occasional
  - em dash: 13 instances (used, but not dominant)

Usage:
  echo "text" | python3 de_emdash.py
  python3 de_emdash.py input.txt
  python3 de_emdash.py input.txt -o output.txt
  python3 de_emdash.py --max-emdash 2 input.txt   # keep up to 2 em dashes
"""

import sys
import re
import random
import argparse

# Em dash patterns in order of specificity
# Paired: word — aside — word (aside must not cross sentence boundaries)
PAIRED_EMDASH = re.compile(r'(\S+)\s*—\s*([^—.!?\n]+?)\s*—\s*(\S+)')
SINGLE_EMDASH = re.compile(r'\s*—\s*')  # standalone em dash


def classify_emdash_usage(text: str, match_start: int, match_end: int) -> str:
    """Classify how an em dash is being used based on context."""
    before = text[:match_start].rstrip()
    after = text[match_end:].lstrip()

    # If the after-text starts with a short word and leads to a period,
    # it's likely a dramatic pivot: "That's Locutus — quietly."
    after_words = after.split()
    if after_words and len(after_words[0]) <= 4 and not after_words[0][0].isupper():
        return 'pivot'

    # If what follows is a complete clause (has a verb-like word),
    # it's an elaboration
    if after_words and len(after_words) > 3:
        return 'elaboration'

    # Short continuation
    return 'continuation'


def replace_paired_emdashes(text: str) -> str:
    """Replace paired em dashes (parenthetical asides) with Michael's devices."""
    replacements = []

    for match in PAIRED_EMDASH.finditer(text):
        aside = match.group(2).strip()
        # Michael uses parentheses or hyphen-pairs for asides
        # Weighted toward parentheses for short asides, hyphens for longer
        if len(aside) < 40:
            replacement = f'{match.group(1)} ({aside}) {match.group(3)}'
        else:
            replacement = f'{match.group(1)} - {aside} - {match.group(3)}'
        replacements.append((match.start(), match.end(), replacement))

    # Apply replacements in reverse order to preserve positions
    for start, end, replacement in reversed(replacements):
        text = text[:start] + replacement + text[end:]

    return text


def replace_single_emdashes(text: str, max_keep: int = 2) -> str:
    """Replace single em dashes with Michael's natural devices.

    Keeps up to max_keep em dashes in the piece (Michael does use them,
    just not as his primary device).
    """
    matches = list(SINGLE_EMDASH.finditer(text))
    if not matches:
        return text

    # If we're under the limit, keep them all
    if len(matches) <= max_keep:
        return text

    # Decide which ones to keep (prioritize dramatic pivots)
    keep_indices = set()
    for i, match in enumerate(matches):
        ctx = classify_emdash_usage(text, match.start(), match.end())
        if ctx == 'pivot' and len(keep_indices) < max_keep:
            keep_indices.add(i)

    # If we still have room, keep random ones
    remaining = [i for i in range(len(matches)) if i not in keep_indices]
    while len(keep_indices) < max_keep and remaining:
        pick = random.choice(remaining)
        remaining.remove(pick)
        keep_indices.add(pick)

    # Replace the ones we're not keeping
    # Work backwards to preserve positions
    for i in reversed(range(len(matches))):
        if i in keep_indices:
            continue

        match = matches[i]
        ctx = classify_emdash_usage(text, match.start(), match.end())

        if ctx == 'elaboration':
            # Michael uses " - " for elaboration
            replacement = ' - '
        elif ctx == 'pivot':
            # Period + new sentence for hard pivots
            before = text[:match.start()].rstrip()
            if before and before[-1] not in '.!?':
                replacement = '. '
            else:
                replacement = ' '
        else:
            # Continuation: comma or hyphen
            replacement = ' - '

        text = text[:match.start()] + replacement + text[match.end():]

    return text


def de_emdash(text: str, max_keep: int = 2) -> str:
    """Main processing pipeline."""
    # Step 1: Handle paired em dashes first (they're the clearest pattern)
    text = replace_paired_emdashes(text)

    # Step 2: Handle remaining single em dashes
    text = replace_single_emdashes(text, max_keep=max_keep)

    # Step 3: Clean up any double spaces introduced
    text = re.sub(r'  +', ' ', text)

    # Step 4: Clean up period-space-lowercase (capitalize after new sentences)
    def capitalize_after_period(m):
        return m.group(1) + m.group(2).upper()
    text = re.sub(r'(\. )([a-z])', capitalize_after_period, text)

    return text


def main():
    parser = argparse.ArgumentParser(
        description='Replace em dashes with Michael\'s natural punctuation devices'
    )
    parser.add_argument('input', nargs='?', help='Input file (reads stdin if omitted)')
    parser.add_argument('-o', '--output', help='Output file (writes stdout if omitted)')
    parser.add_argument('--max-emdash', type=int, default=2,
                        help='Maximum em dashes to keep per piece (default: 2)')
    parser.add_argument('--seed', type=int, help='Random seed for reproducible output')

    args = parser.parse_args()

    if args.seed is not None:
        random.seed(args.seed)

    # Read input
    if args.input:
        with open(args.input, 'r') as f:
            text = f.read()
    else:
        text = sys.stdin.read()

    # Process
    result = de_emdash(text, max_keep=args.max_emdash)

    # Write output
    if args.output:
        with open(args.output, 'w') as f:
            f.write(result)
    else:
        sys.stdout.write(result)


if __name__ == '__main__':
    main()
