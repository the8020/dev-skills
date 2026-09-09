# 80|20 development skills

The `the8020/dev-skills` package supplies development guidance for Codex and
Claude Code. It includes the `8020-dev` router and focused skills for shared
types, databases, programs and jobs, services, and UUI.

[`workspace.md`](workspace.md) is the single source mounted as both
`/workspace/AGENTS.md` and `/workspace/CLAUDE.md`. It explains the gVisor/Debian
environment, storage, activation before live testing, and the host URL supplied
in `DEVELOPMENT_SYSTEM_URL`. The kernel owns the mounts and environment values;
this package owns the instructions.

## Use in a development sandbox

Shipped skills are mounted read-only at `/workspace/skills/builtin`. To edit
them, change `/workspace/packages/the8020/dev-skills` and publish through normal
package activation:

```sh
activate --package the8020/dev-skills --message "Update development guidance"
```

Add personal skills at `/workspace/skills/custom/<name>/SKILL.md`, with matching
`name` and `description` frontmatter. Custom skills override built-ins with the
same name and remain private to their developer. They survive restart,
activation, and source reset; factory reset removes them.

After adding, renaming, or removing skills, refresh both agents' discovery:

```sh
/workspace/scripts/setup-agent-skills.sh
```

Startup and CLI installation also refresh discovery. Reload the agent if its
catalog is cached. The kernel mounts and bootstrap helpers are required for this
integration; cloning this repository alone does not install skills into an
agent.

## Maintain and verify

Follow [AGENTS.md](AGENTS.md) before editing. This repository contains shipped
guidance and its discovery helper. Personal skills, credentials, local agent
settings, runtime data, and generated artifacts stay outside version control.

With Deno, Bash, and `flock` available:

```sh
deno task check
deno task test
```

Fresh deployments include this package through the kernel's
`defaults/bootstrap-packages.toml`. Release builds select a numeric
`major.minor.patch` Git tag compatible with the kernel release. Existing
instances install the package through package administration; bootstrap is not
reapplied on upgrades.
