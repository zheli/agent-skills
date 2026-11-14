#!/usr/bin/env bash
# Run inside the sandbox under test; a command failure alone is not proof of denial.
set -u

usage() {
  echo 'usage: probe.sh read <existing-path> | write <existing-directory> | net <http(s)-url> | exec <command> [args...]'
}
if [ "${1:-}" = '--help' ]; then usage; exit 0; fi
if [ "$#" -lt 2 ]; then usage >&2; exit 2; fi
kind=$1
shift
target=$1

result() {
  if [ "$1" -eq 0 ]; then echo "ALLOWED $kind $target"; exit 0; fi
  echo "ERROR $kind $target (exit $1); inspect evidence before classifying as BLOCKED" >&2
  exit 1
}

case "$kind" in
  read)
    if [ -d "$target" ]; then ls -A -- "$target" >/dev/null; else head -c 1 -- "$target" >/dev/null; fi
    result $?
    ;;
  write)
    # mktemp avoids collisions and never truncates an existing user file.
    if [ ! -d "$target" ]; then echo 'ERROR write requires an existing directory' >&2; exit 2; fi
    f=$(mktemp "${target%/}/.pi-sandbox-probe.XXXXXXXX") || result $?
    trap 'rm -f -- "$f"' EXIT
    rm -- "$f"
    result $?
    ;;
  net)
    case "$target" in http://*|https://*) ;; *) echo 'ERROR expected http(s) URL' >&2; exit 2;; esac
    curl -sS -o /dev/null --max-time 15 -- "$target"
    result $?
    ;;
  exec)
    "$@"
    result $?
    ;;
  *) usage >&2; exit 2 ;;
esac
