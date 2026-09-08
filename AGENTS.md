Parent DOX: [source workspace](../AGENTS.md). The parent link describes sibling
source checkouts; deployed sandbox work also follows `/workspace/AGENTS.md`.

Framework source:
[agent0ai/dox/AGENTS.md](https://github.com/agent0ai/dox/blob/765ae4ac02cc884eefcd41a3d0f71941721adb89/AGENTS.md).

# DOX framework

- DOX is highly performant AGENTS.md hierarchy installed here
- Agent must follow DOX instructions across any edits

## Core Contract

- AGENTS.md files are binding work contracts for their subtrees
- Work products, source materials, instructions, records, assets, and durable
  docs must stay understandable from the nearest applicable AGENTS.md plus every
  parent AGENTS.md above it

## Read Before Editing

1. Read the root AGENTS.md
2. Identify every file or folder you expect to touch
3. Walk from the repository root to each target path
4. Read every AGENTS.md found along each route
5. If a parent AGENTS.md lists a child AGENTS.md whose scope contains the path,
   read that child and continue from there
6. Use the nearest AGENTS.md as the local contract and parent docs for repo-wide
   rules
7. If docs conflict, the closer doc controls local work details, but no child
   doc may weaken DOX

Do not rely on memory. Re-read the applicable DOX chain in the current session
before editing.

## Update After Editing

Every meaningful change requires a DOX pass before the task is done.

Update the closest owning AGENTS.md when a change affects:

- purpose, scope, ownership, or responsibilities
- durable structure, contracts, workflows, or operating rules
- required inputs, outputs, permissions, constraints, side effects, or artifacts
- user preferences about behavior, communication, process, organization, or
  quality
- AGENTS.md creation, deletion, move, rename, or index contents

Update parent docs when parent-level structure, ownership, workflow, or child
index changes. Update child docs when parent changes alter local rules. Remove
stale or contradictory text immediately. Small edits that do not change behavior
or contracts may leave docs unchanged, but the DOX pass still must happen.

## Hierarchy

- Root AGENTS.md is the DOX rail: project-wide instructions, global preferences,
  durable workflow rules, and the top-level Child DOX Index
- Child AGENTS.md files own domain-specific instructions and their own Child DOX
  Index
- Each parent explains what its direct children cover and what stays owned by
  the parent
- The closer a doc is to the work, the more specific and practical it must be

## Child Doc Shape

- Create a child AGENTS.md when a folder becomes a durable boundary with its own
  purpose, rules, responsibilities, workflow, materials, or quality standards
- Work Guidance must reflect the current standards of the project or user
  instructions; if there are no specific standards or instructions yet, leave it
  empty
- Verification must reflect an existing check; if no verification framework
  exists yet, leave it empty and update it when one exists

Default section order:

- Purpose
- Ownership
- Local Contracts
- Work Guidance
- Verification
- Child DOX Index

## Style

- Keep docs concise, current, and operational
- Document stable contracts, not diary entries
- Put broad rules in parent docs and concrete details in child docs
- Prefer direct bullets with explicit names
- Do not duplicate rules across many files unless each scope needs a local
  version
- Delete stale notes instead of explaining history
- Trim obvious statements, repeated rules, misplaced detail, and warnings for
  risks that no longer exist

## Closeout

1. Re-check changed paths against the DOX chain
2. Update nearest owning docs and any affected parents or children
3. Refresh every affected Child DOX Index
4. Remove stale or contradictory text
5. Run existing verification when relevant
6. Report any docs intentionally left unchanged and why

## Child DOX Index

No child DOX documents. This package root owns all shipped skills and discovery.

# Zen for agents

## 1. Don't do 20|80.

80|20 supports a ton of features with very little effort. Don't spend a ton of
effort on a very little feature.

## 2. Use before inventing.

Combine and reuse existing concepts first. When a new concept is necessary,
design it to serve more than the immediate use case and cooperate well with
existing concepts.

## 3. Respect boundaries.

Do not inject unrelated features into existing functionality. Package your
functionality as a standalone capability with clear responsibilities and
explicit dependencies. Integrate through the contracts of the components
involved.

## 4. The kernel is holy.

Touch the kernel only when absolutely necessary and with great care. No
application logic belongs there; it provides the foundation for the application
layer. Keep application behavior and policy in independently evolving Deno
packages.

## 5. Use the shared runtime.

Build on ordinary programs, services, jobs, hooks, and events using the existing
Worker runtime. Access kernel capabilities through the typed bridge and trusted
execution context. Extend shared mechanisms at their owner when necessary,
keeping them reusable across packages.

## 6. Share definitions across layers.

Compose ordinary Zod schemas and reuse their meaning across validation, database
tables, forms, and lists. Let shared database codecs handle physical
representations and the UUI framework handle browser presentation. Keep these
translations in their owning layers so application programs stay consistent and
small.

## 7. Give state and lifetimes clear owners.

Keep durable shared facts in the database and make node-local indexes and caches
explicitly derived. Distinguish connections, logical executions, Workers, and
sandboxes, with clear rules for completion, cancellation, and cleanup.
Reconnection or retry must respect the original execution’s identity and
outcome.

## 8. Bound work and resource use.

Keep queries, queues, retained output, background scans, and concurrency bounded
as the platform grows. Use targeted reads and updates, short transactions, and
explicit timeouts. Avoid holding broad locks across filesystem, process, or
network operations.

## 9. Fix and verify at the owner.

Read the applicable contracts and trace the full path before changing code.
Repair shared defects at their source, then verify both the owning layer and the
affected application flow. Keep documentation aligned with deliberate changes
across repository boundaries.

# Development skills

## Purpose

- Ship portable Codex and Claude development guidance as the independently
  editable and activatable `the8020/dev-skills` package.

## Ownership

- The public repository is `https://github.com/the8020/dev-skills`. `README.md`
  owns installation and contributor orientation; `.gitignore` excludes secrets,
  personal agent data, local tools, and generated artifacts from publication.
- `8020-dev/SKILL.md` owns platform orientation, domain routing, activation, and
  live verification. The `the8020-dev-*` skills own types, database, programs
  and jobs, services, and UUI guidance; exact APIs remain in their owning
  packages.
- `workspace.md` supplies the sandbox's read-only `/workspace/AGENTS.md` and
  `/workspace/CLAUDE.md`; it is an installation payload, not source-tree DOX.
- `setup-agent-skills.sh` owns merging built-in and developer skills into native
  user discovery directories. The kernel owns mount boundaries and startup.

## Local Contracts

- The activated package is mounted read-only at `/workspace/skills/builtin`.
  Edit shipped guidance in `/workspace/packages/the8020/dev-skills` and publish
  through ordinary package activation. Kernel installation never copies skills.
- Developer skills live at `/workspace/skills/custom/<name>/SKILL.md`, mounted
  writable from `users/<user-id>/dev-sandbox/skills/`. They stay private and
  survive restart, source reset, and activation; factory reset removes them.
- Discovery links combine both sources in `~/.agents/skills` and
  `${CLAUDE_CONFIG_DIR:-~/.claude}/skills`. A custom skill wins over a built-in
  with the same folder name. Existing unmanaged home skills are preserved with a
  collision diagnostic. Refresh removes only links into the workspace skills
  root.
- Run `/workspace/scripts/setup-agent-skills.sh` after adding, removing, or
  renaming skills; sandbox startup and CLI installation also run it. Existing
  links read edits directly. Reload/restart the agent if its catalog is cached.
- Global instruction pointers are appended once, preserving existing contents,
  in `${CODEX_HOME:-~/.codex}/AGENTS.md` and Claude's `CLAUDE.md`.
- Refresh holds a per-user `flock` at `~/.agents/.8020-skills.lock` so startup,
  installers, and manual refreshes cannot race over links or instruction files.
- Always use `8020-dev`, then only the relevant domain skills. Use portable
  `name` and `description` frontmatter with the folder matching the name. Keep
  `8020-dev` stable and use `the8020-dev-<domain>` for shipped focused skills.
- Keep examples grounded in current source, including activation's current
  sandbox restart limitation. Never imply plain sandbox Deno has a Worker
  bridge. Do not duplicate implementations, vendor manuals, or credentials.

## Work Guidance

- Before pushing, inspect the exact staged files for secrets and unintended
  artifacts. Keep release tags numeric (`major.minor.patch`) so the kernel
  deployment resolver can select compatible package releases.
- Fresh instances stage this package from the kernel bootstrap list. Install it
  through ordinary package administration on existing instances before deploying
  a kernel that requires these mounts; bootstrap is not reapplied on upgrades.
- Trace examples to their owning packages. Update the router when adding or
  removing a domain skill and maintain selective relative references.
- Shared fields and structures belong to their semantic owner; database and UUI
  guidance share the types skill instead of duplicating its contract.

## Verification

- `deno task check` checks formatting and shell syntax; `deno task test` checks
  discovery, custom precedence, concurrent refresh, and preservation of native
  user data with isolated homes, without agent installation, login, or model
  requests.
- Kernel development tests verify actual read-only and persistent mounts,
  publication, per-user isolation, and lifecycle persistence.
- Validate authored skills with skill-creator's `quick_validate.py` when
  available.
