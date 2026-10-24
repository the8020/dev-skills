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

## User Preferences

When the user requests a durable behavior change, record it here or in the
relevant child AGENTS.md

- Keep `/workspace/AGENTS.md` and `/workspace/CLAUDE.md` sourced from this
  package. Explain the existing gVisor sandbox, Debian/root tooling, storage,
  activation before live testing, and the host system URL here, not in kernel
  instruction payloads.

## Child DOX Index

No child DOX documents. This package root owns all shipped skills and discovery.

# Zen for agents

## 1. Don't do 20|80.

Implement the smallest complete solution for the requested behavior and existing
contracts. Do not invent stronger guarantees, extra features, or machinery for
hypothetical future needs or failures. Preserve required correctness, security,
and data integrity; report limitations outside the contract instead of silently
expanding scope.

## 2. Use before inventing.

Reuse the existing owner, standard library, and platform mechanisms before
adding concepts. Add an abstraction or subsystem only when a concrete current
requirement cannot be met simply with what already exists. Solve that
requirement without speculative extensibility or generalization.

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

Persist only state required by current contracts, at its owning layer; do not
duplicate authoritative data to invent stronger guarantees. Keep node-local
indexes and caches explicitly derived, and distinguish connections, executions,
Workers, and sandboxes with clear completion and cleanup rules. Reconnection or
retry must respect the original execution's identity and outcome.

## 8. Bound work and resource use.

Keep queries, queues, retained output, background scans, and concurrency bounded
as the platform grows. Use targeted reads and updates, short transactions, and
explicit timeouts. Avoid holding broad locks across filesystem, process, or
network operations.

## 9. Fix and verify at the owner.

Read the applicable contracts and trace the full path before changing code.
Repair shared defects at their source, then verify both the owning layer and the
affected application flow. Before closeout, remove additions without a current
requirement and document only accepted behavior; agent-written tests and DOX do
not authorize extra requirements.

# Development skills

## Purpose

- Ship portable Codex and Claude development guidance as the independently
  editable and activatable `the8020/dev-skills` package.

## Ownership

- The public repository is `https://github.com/the8020/dev-skills`. `README.md`
  owns installation and contributor orientation; `.gitignore` excludes secrets,
  personal agent data, local tools, and generated artifacts from publication.
- `8020-dev/SKILL.md` owns platform orientation, domain routing, the
  authorization guide (naming, declarations, enforcement, unaudited list
  queries, attributes, declared roles, tile visibility, audit), activation, and
  live verification. The `the8020-dev-*` skills own types, database, programs
  and jobs, services, and UUI guidance; exact APIs remain in their owning
  packages.
- `workspace.md` supplies the sandbox's read-only `/workspace/AGENTS.md` and
  `/workspace/CLAUDE.md`; it owns immediate environment orientation and is an
  installation payload, not source-tree DOX. Both mounts use the same file.
- `setup-agent-skills.sh` owns merging built-in and developer skills into native
  user discovery directories. The kernel owns mount boundaries and startup.
- `the8020-dev-uui-control` owns browser-independent UUI CLI operation and its
  Deno script. The thin platform `uui` helper delegates here. Native allowances
  and CLI session state live under `~/.the8020` with private file permissions;
  command results never print credentials. Revisions/claim tickets stay
  internal.
- `the8020-dev-db/scripts/sql.ts` owns the sandbox SQL CLI. The thin platform
  `sql` helper delegates here; native authentication, SQL execution, and result
  limits remain kernel-owned.

## Local Contracts

- `8020-dev/scripts/kernel-logs.ts` implements the `kernel-logs` helper using
  the existing sandbox endpoint/owner/bearer secret. It sends one JSON query,
  never follows redirects or retries, has a 35-second deadline, and prints the
  native `{node_id,page}` unchanged. Native ingress pins the host node and owns
  limits, literal text search, retention and cursors. No credentials or new
  session state are stored. `8020-dev/SKILL.md` and `workspace.md` provide
  discovery, executable examples and unavailable/expired guidance; ordinary
  package activation and existing discovery install this extension.

- Standalone SQL, log and UUI CLI scripts use only platform primitives, with no
  workspace imports. Their launchers (and executable shebangs) use `--no-config`
  without changing permissions; ordinary package checks still use the workspace.
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
- Keep examples grounded in current source. Activation preserves running
  processes; private source persists without checkpoint timers. Never imply
  plain sandbox Deno has a Worker bridge. Do not duplicate implementations,
  vendor manuals, or credentials.
- Sandbox Deno checks use the read-only runtime SDK and shared workspace config.
  Agents run ordinary package tasks; package configs own dependencies and tasks,
  while the workspace owns platform aliases. Activation is not a substitute for
  TypeScript checking.
- Keep the nine agent principles synchronized with `zen/AGENTS.md` and the
  source-workspace root. Carry their scope discipline into `workspace.md` so
  sandbox agents receive it before selecting a package or skill.
- `workspace.md` explains the sandbox's actual OS/tooling, root confinement,
  persistent/temporary paths, private edits, activation, and live verification.
  Use the kernel-supplied `DEVELOPMENT_SYSTEM_URL` for the host node's main HTTP
  listener; distinguish it from the private activation endpoint and external
  browser URL. Document its start-time lifetime and discovery on older kernels.
- Workspace instruction file mounts refresh on sandbox start; replacing the
  activated file can leave running sandboxes reading their previous binding.
  Published skills remain visible through the built-in directory mount.
- SQL uses the existing sandbox endpoint, owner, and bearer token. Send scalar
  parameters as an unparsed JSON-array string and print native JSON unchanged to
  preserve integer precision. Requests have a bounded deadline, never retry, and
  access the shared live database independently of activation. This grants no
  general shell Worker bridge and introduces no credentials or session store.

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

### UI Rules

- Do not add explanatory helper copy that restates what the control already
  implies (e.g. "optional", "works without selection", "failure falls back to
  X"). Prefer clear labels and option text; surface status in results when
  needed, not as instructional paragraphs under every field.
- Keep UI copy concise. Avoid tutorial-style descriptions unless the user
  explicitly asks for onboarding help.

## Verification

- Check the UUI-control script with `deno check`; UUI's
  `agent_native_fixture.ts` runs it inside a real sandbox and hands its live
  execution to Chromium. Its session tests cover command validation and fallback
  bindings. No duplicate UI protocol implementation belongs in this package.

- `deno task check` checks formatting, shell syntax, and all three CLI scripts;
  admin-core's native diagnostics browser fixture executes the installed log
  helper and Deno paging example in an ordinary sandbox, checking host identity,
  filters, continuation, bad tokens and foreign-node rejection. The skill uses
  the image's Deno, with no Python dependency. Native SQL adapter tests in the
  kernel execute the shipped SQL script against a real disposable SQLite
  database, including writes, bounds, and failures. `deno task test` checks
  discovery, custom precedence, concurrent refresh, and preservation of native
  user data with isolated homes, without agent installation, login, or model
  requests.
- Kernel development tests verify actual read-only and persistent mounts,
  publication, per-user isolation, and lifecycle persistence.
- Validate authored skills with skill-creator's `quick_validate.py` when
  available.
