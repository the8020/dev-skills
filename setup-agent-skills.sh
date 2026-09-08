#!/usr/bin/env bash
set -euo pipefail

skills_root=$(cd -- "${1:-/workspace/skills}" && pwd -P)
[[ -d "$skills_root/builtin" && -d "$skills_root/custom" ]] || {
  echo "Expected builtin and custom directories under $skills_root" >&2
  exit 1
}
codex_root=${CODEX_HOME:-"$HOME/.codex"}
claude_root=${CLAUDE_CONFIG_DIR:-"$HOME/.claude"}

# Startup, installers, and explicit refreshes share the same user's discovery.
mkdir -p -- "$HOME/.agents"
exec 9> "$HOME/.agents/.8020-skills.lock"
flock 9

for discovery in "$HOME/.agents/skills" "$claude_root/skills"; do
  mkdir -p -- "$discovery"
  # Workspace source links are ours, including retired paths; preserve others.
  for target in "$discovery"/*; do
    [[ -L "$target" ]] || continue
    case "$(readlink -- "$target")" in
      "$skills_root/"*) rm -- "$target" ;;
    esac
  done
  # Custom names override built-ins identically in both agent tools.
  for source in custom builtin; do
    for entry in "$skills_root/$source"/*/SKILL.md; do
      [[ -f "$entry" ]] || continue
      skill_dir=${entry%/SKILL.md}
      name=${skill_dir##*/}
      if [[ "$source" == builtin && -f "$skills_root/custom/$name/SKILL.md" ]]; then
        continue
      fi
      target="$discovery/$name"
      if [[ -e "$target" || -L "$target" ]]; then
        printf 'Preserving existing agent skill: %s (workspace skill %s skipped)\n' "$target" "$name" >&2
        continue
      fi
      ln -s -- "$skill_dir" "$target"
    done
  done
done

# User scope keeps the workspace contract visible when launched inside a Git repo.
for instructions in "$codex_root/AGENTS.md" "$claude_root/CLAUDE.md"; do
  mkdir -p -- "${instructions%/*}"
  directive="For development under /workspace/packages, always read /workspace/AGENTS.md and use the 8020-dev skill."
  if [[ ! -e "$instructions" && ! -L "$instructions" ]]; then
    printf '%s\n' "$directive" > "$instructions"
  elif ! grep -Fqx -- "$directive" "$instructions"; then
    printf '\n%s\n' "$directive" >> "$instructions"
  fi
done
