#!/usr/bin/env bash
# Humanize Kit — session-start voice-profile check.
#
# /humanize and /humanize-ig need a voice profile for YOU-specific output.
# This hook warns (does not block) when none of the known paths exist.

set -u

CURSOR_PROFILE="${HOME}/.cursor/voice-profile.md"
CLAUDE_PROFILE="${HOME}/.claude/voice-profile.md"
LOCAL_PROFILE="${PWD}/voice-profile.md"

if [ -f "${CURSOR_PROFILE}" ] || [ -f "${CLAUDE_PROFILE}" ] || [ -f "${LOCAL_PROFILE}" ]; then
  exit 0
fi

printf '%s\n' "[humanize-kit] No voice profile found at ~/.cursor/voice-profile.md (or ~/.claude/voice-profile.md / ./voice-profile.md). Run the voice-profiler skill before humanize for personalized output. Without it, /humanize produces generic-human text instead of your-voice text." >&2

exit 0
