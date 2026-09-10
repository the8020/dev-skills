# You are in an 80|20 development sandbox

You are already running inside a gVisor (`runsc`) sandbox managed by the 80|20
platform. This is the developer's tool environment; the host kernel runs the
activated application in separate service and job Workers.

## Operating environment

- The standard image is Debian GNU/Linux with Bash, Deno, Git, curl, and
  APT/dpkg. Check `/etc/os-release` and tool versions for this sandbox's exact
  image. You run as Linux `root` (UID 0), with home `/root`; use `apt-get`
  directly when a required tool is missing. Root is confined by gVisor and the
  supplied mounts. Use the existing sandbox for development; nested Docker,
  systemd, and host kernel administration are not prerequisites.
- `/root` and installed system tools persist across ordinary sandbox restarts
  and activation. `/tmp` and `/run` are temporary. Source reset discards private
  package edits; factory reset also removes the developer's home, tools, and
  custom skills. Use these resets only when discarding that state is intended.
- `/workspace/packages/<namespace>/<package>/` contains the editable package
  repositories. Each package is an independent Git root; `/workspace` and the
  packages tree have no master repository. Package edits are private until
  activation publishes them to the shared 80|20 system.
- `/workspace/scripts`, `/workspace/skills/builtin`, `/workspace/AGENTS.md`, and
  `/workspace/CLAUDE.md` are read-only platform mounts. The activated
  `the8020/dev-skills` package owns this guide and the built-in skills. Edit
  `/workspace/packages/the8020/dev-skills/workspace.md` to change both mounted
  instruction files, then activate that package. Mounted instruction files
  refresh on the sandbox's next start; a running sandbox can retain the previous
  file binding. The kernel supplies mounts, not the guide's contents.
- Plain shell `deno run` processes have no Worker bridge, execution principal,
  or platform database capability. Run local package checks in the shell; test
  platform behavior through activated programs and services on the host system.

## Host 80|20 system URL

`DEVELOPMENT_SYSTEM_URL` is the host node's HTTP base URL as reachable from this
sandbox. Inspect just this value:

```sh
printf '%s\n' "$DEVELOPMENT_SYSTEM_URL"
curl --fail --show-error --max-time 10 "${DEVELOPMENT_SYSTEM_URL:?}/health"
```

Development uses the kernel's host network, so `127.0.0.1` reaches the kernel's
network namespace (its container when deployed with Docker). The URL uses the
configured `network.main_port`; `http://127.0.0.1:8080` is only the default and
Docker deployments may use another internal port. Use the supplied URL rather
than guessing from a published host port. For a browser outside this network,
use the instance's public URL supplied by the user or deployment.

The environment value is captured at sandbox start. If it is absent on an older
kernel or an administrator changes the main port while this sandbox is running,
obtain the current address from node administration or the supplied instance
URL. `DEVELOPMENT_ACTIVATION_ENDPOINT` is a separate private control listener;
its sandbox token also permits a native exchange for your own users allowance.
Use `uui` and the `the8020-dev-uui-control` skill to operate authenticated
screens without a browser or password. Its local allowance stays in `~/.the8020`
and is revocable from Sign-ins. It cannot authenticate public HTTP requests.
Keep tokens private; avoid dumping the entire environment for discovery.

The system UI is at the base URL's `/`; services use
`/<namespace>/<package>/<service>/<relative-route>`. `/health` proves kernel
readiness only. Verify the affected service or program, using application login
credentials where required.

## Activate before testing the running application

Run the package's local checks, then preview and activate the affected package:

```sh
activate --preview
activate --package the8020/demo --message "Describe the change"
```

Replace the example package ID; repeat `--package` for multiple packages.
Omitting it selects all changed packages. Activation commits and publishes
selected changes, synchronizes schema, and runs package hooks; it affects the
shared running system and does not push Git remotes. Saving files or making a
plain Git commit does not activate them. Check the command's exit status and
result (`--json` gives machine-readable output); resolve reported conflicts
before testing the live result.

Activation preserves this sandbox, running agents, and named terminals. Private
source survives sandbox loss without checkpointing. Untouched paths follow
shared updates; private edits retain their originals for Git conflict
resolution, and edits made after an activation capture remain private. The
[8020-dev router](/workspace/skills/builtin/8020-dev/SKILL.md) owns the detailed
activation and verification workflow, including fresh service sessions and
browser reloads to exercise updated code.

## Development starts with 8020-dev

For all development here, use `8020-dev` from your agent's merged skill catalog
(including a custom override, if present), then the relevant domain skills. The
[shipped router](/workspace/skills/builtin/8020-dev/SKILL.md) explains
independent package repositories, private edits, activation, and live
verification. Read the target package's AGENTS.md and its applicable child
contracts before editing; complete their DOX pass and checks.

Add personal skills at `/workspace/skills/custom/<name>/SKILL.md` with matching
`name` and `description` frontmatter. That writable directory persists in your
user sandbox data across restart, source reset, and activation; factory reset
removes it. Custom names override built-ins. After adding, removing, or renaming
a skill, run `/workspace/scripts/setup-agent-skills.sh` and reload the agent if
needed. Startup and CLI installation also refresh discovery. Both Codex and
Claude use home-directory links, keeping these skills visible inside package Git
roots. Existing unmanaged home skills are preserved and collisions are reported.
Custom skills stay private; package activation does not publish them.

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

- Always use the 8020-dev router for development and the applicable domain
  skills.
- Keep built-in skills and workspace instructions read-only. Developer skills
  are writable and private in `/workspace/skills/custom`.
- Keep sandbox orientation and activation guidance in `the8020/dev-skills`,
  grounded in the actual image, mounts, and supplied host system URL.

## Child DOX Index

- [dev-skills/AGENTS.md](/workspace/skills/builtin/AGENTS.md): shipped
  development skills and their maintenance/discovery contract.
- Each installed `packages/<namespace>/<package>/AGENTS.md` owns that
  independent repository and its indexed descendants. Inspect the selected
  package's actual tree; installed and custom packages vary by system.
