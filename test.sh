#!/usr/bin/env bash
set -euo pipefail

package_root=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)
test_root=$(mktemp -d)
trap 'rm -rf -- "$test_root"' EXIT
export HOME="$test_root/home" CODEX_HOME="$test_root/codex-config" CLAUDE_CONFIG_DIR="$test_root/claude-config"
skills_root="$test_root/skills"
mkdir -p "$skills_root/builtin" "$skills_root/custom" "$CODEX_HOME" "$CLAUDE_CONFIG_DIR/skills/personal"
for entry in "$package_root"/*/SKILL.md; do
  cp -R -- "${entry%/SKILL.md}" "$skills_root/builtin/"
done
printf 'Keep my instructions.\n' > "$CODEX_HOME/AGENTS.md"
printf 'Personal skill\n' > "$CLAUDE_CONFIG_DIR/skills/personal/SKILL.md"
setup() { bash "$package_root/setup-agent-skills.sh" "$skills_root"; }
assert_links() {
  for discovery in "$HOME/.agents/skills" "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills"; do
    test "$(readlink -- "$discovery/$1")" = "$skills_root/$2/$1"
    cmp "$discovery/$1/SKILL.md" "$skills_root/$2/$1/SKILL.md"
  done
}
# Refresh also replaces managed links retained from the former flat skills mount.
mkdir -p "$HOME/.agents/skills"
ln -s "$skills_root/8020-dev" "$HOME/.agents/skills/8020-dev"
setup
setup
# Startup can overlap an installer or explicit refresh in the same retained home.
setup & first=$!
setup & second=$!
wait "$first"
wait "$second"
for entry in "$skills_root/builtin"/*/SKILL.md; do
  name=${entry%/SKILL.md}
  assert_links "${name##*/}" builtin
done
for instructions in "$CODEX_HOME/AGENTS.md" "$CLAUDE_CONFIG_DIR/CLAUDE.md"; do
  test "$(grep -Fc 'always read /workspace/AGENTS.md' "$instructions")" = 1
done
grep -Fxq 'Keep my instructions.' "$CODEX_HOME/AGENTS.md"
grep -Fxq 'Personal skill' "$CLAUDE_CONFIG_DIR/skills/personal/SKILL.md"

mkdir -p "$skills_root/custom/my-skill" "$skills_root/custom/the8020-dev-types"
printf 'Custom skill\n' > "$skills_root/custom/my-skill/SKILL.md"
printf 'My types override\n' > "$skills_root/custom/the8020-dev-types/SKILL.md"
setup
assert_links my-skill custom
assert_links the8020-dev-types custom
# Linked content updates without another refresh.
printf 'Edited custom skill\n' > "$skills_root/custom/my-skill/SKILL.md"
grep -Fxq 'Edited custom skill' "$HOME/.agents/skills/my-skill/SKILL.md"
printf 'Published built-in edit\n' >> "$skills_root/builtin/8020-dev/SKILL.md"
grep -Fxq 'Published built-in edit' "$CLAUDE_CONFIG_DIR/skills/8020-dev/SKILL.md"

mv "$skills_root/custom/my-skill" "$skills_root/custom/renamed"
rm -rf -- "$skills_root/custom/the8020-dev-types" "$skills_root/builtin/the8020-dev-db"
setup
assert_links renamed custom
assert_links the8020-dev-types builtin
for discovery in "$HOME/.agents/skills" "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills"; do
  test ! -L "$discovery/my-skill"
  test ! -L "$discovery/the8020-dev-db"
done

# Native user content wins a collision; refreshing must not erase it or fail startup.
rm -- "$HOME/.agents/skills/8020-dev"
mkdir "$HOME/.agents/skills/8020-dev"
printf 'Keep this skill\n' > "$HOME/.agents/skills/8020-dev/SKILL.md"
ln -s "$test_root/missing-personal-skill" "$HOME/.agents/skills/personal-link"
setup 2> "$test_root/diagnostic"
grep -Fq 'Preserving existing agent skill:' "$test_root/diagnostic"
grep -Fxq 'Keep this skill' "$HOME/.agents/skills/8020-dev/SKILL.md"
test "$(readlink "$HOME/.agents/skills/personal-link")" = "$test_root/missing-personal-skill"
# Native default config locations work too.
export HOME="$test_root/default-home" CODEX_HOME= CLAUDE_CONFIG_DIR=
setup
assert_links renamed custom
test -f "$HOME/.codex/AGENTS.md"
test -f "$HOME/.claude/CLAUDE.md"
printf 'Skill discovery checks passed.\n'
