---
name: 8020-dev
description: Develop, fix, review, and test 80|20 packages inside a development sandbox. Always use for development under /workspace/packages; explains package ownership, routes to domain skills, publishes through activate, and verifies live kernel services.
---

# Develop in 80|20

Read `/workspace/AGENTS.md`, the target package's `AGENTS.md`, and every child
contract on the path to files you touch. These skills give orientation; the
owning package contract and current source give the exact API and checks.

## Workspace and ownership

- `/workspace/packages/<namespace>/<package>/` contains independent Git
  repositories, each identified as `<namespace>/<package>`. `/workspace` and the
  packages tree are not a master repository. Run Git inside the chosen package
  and preserve other developers' work.
- A package's `package.toml` describes it; `programs/`, `services/`, `tables/`,
  `hooks/`, and `events/` declare its capabilities. Inspect a nearby working
  example before creating one. `deno.json` owns runtime imports and tasks;
  `deno.local.json` resolves sibling sources for local checks.
- Cross-package imports use `/p/<namespace>/<package>/<file>.ts`. The running
  Worker resolves `/p/` to the activated package tree. `@the8020/kernel`,
  `@the8020/context`, and `@the8020/http` are generic runtime APIs.
- The Go kernel owns node authority, routing, Workers, and sandbox lifetimes.
  Deno packages own application behavior, schemas, services, jobs, and screens.
  Reuse existing package capabilities; fix a shared defect at its owner.
- Edits in this sandbox are private until activation. `/root` and installed
  tools persist; `/tmp` is temporary. `/workspace/scripts` and
  `/workspace/skills/builtin` are read-only. Shipped skills belong to the
  independently editable `the8020/dev-skills` package.
- Add personal skills at `/workspace/skills/custom/<name>/SKILL.md`, with
  matching `name` and `description` frontmatter. Custom skills stay private in
  your persistent sandbox data and override built-ins with the same name. Run
  `/workspace/scripts/setup-agent-skills.sh` after adding/removing/renaming a
  skill, then reload the agent if needed. Edits to linked content are immediate;
  agent catalogs may cache it. To change shipped skills, edit
  `/workspace/packages/the8020/dev-skills` and activate that package normally.
- A shell `deno run` is a developer process, not a platform Worker. It has no
  kernel bridge, execution principal, or database capability. Use package checks
  with their supplied mocks, or exercise real behavior through a service or
  ordinary program running on the kernel.

## Route to the needed skill

Resolve these skill names through the agent catalog so custom overrides apply.
The links below point to the shipped versions.

| Work                                                                               | Read                                                     |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Shared Zod fields, structures, labels/help, value representation                   | [the8020-dev-types](../the8020-dev-types/SKILL.md)       |
| Tables, Kysely, SQL results, schema activation                                     | [the8020-dev-db](../the8020-dev-db/SKILL.md)             |
| Programs, positional inputs, interactive/background invocation, jobs and schedules | [the8020-dev-programs](../the8020-dev-programs/SKILL.md) |
| HTTP/WebSocket services, access policy, runtime testing and reload                 | [the8020-dev-services](../the8020-dev-services/SKILL.md) |
| UUI forms, lists, field help, navigation, browser assets                           | [the8020-dev-uui](../the8020-dev-uui/SKILL.md)           |

For authentication, package administration, or another domain, start with its
owning package's `AGENTS.md`. Load the types skill when shared definitions
change, then the relevant consumer skill; do not load unrelated domain skills.

## Edit, check, activate

1. Inspect each affected repository's status and applicable DOX. Make the change
   at its owner. Run its existing checks (usually `deno task check` and, when
   defined, `deno task test`) and relevant browser/build tasks. Package tasks
   may use sibling kernel sources unavailable in a deployed sandbox; report a
   missing prerequisite rather than rewriting mappings to conceal it.
2. Update the nearest owning DOX when behavior or contracts change. Inspect the
   actual diff, then preview from the sandbox:

   ```sh
   activate --preview
   ```

3. Publish the requested changes, explicitly selecting affected package IDs:

   ```sh
   activate --package the8020/demo --message "Describe the change"
   ```

   Repeat `--package` for multiple packages. Omission selects all changed
   packages. Activation creates one commit per selected changed repository,
   validates/synchronizes schema and runs package hooks, then publishes shared
   sources. It does not push remotes. A plain Git commit is not activation.
   Publication affects the shared running system; follow the user's task scope.
4. Check the exit status and JSON result. Conflicts return nonzero (409 maps to
   exit 3); shared code has not necessarily changed. Inspect returned package
   errors and conflict paths, resolve using the owning workflow, preview, and
   retry. Never reset/discard private work or force Git history to make it pass.

**Current activation limitation:** successful publication can return
`overlay_reset_pending: true`, followed by killing and recreating this sandbox.
The agent and terminals stop; `activate && run-tests` is not a reliable loop.
Persist a short test handoff under `/root` before activation and reconnect to
verify afterward. Do not promise process survival until the deployed activation
implementation has adopted that contract. Uncheckpointed source edits can also
be lost on abrupt runtime loss; do not assume background autosave.

## Verify the live result

Development uses the kernel's host network: `127.0.0.1` reaches the kernel
process's namespace (the kernel container if Docker is used). The main HTTP port
is `network.main_port`, default 8080; use the actual configured value from node
administration or the supplied instance URL. The activation endpoint in
`DEVELOPMENT_ACTIVATION_ENDPOINT` is a separate private control listener.

```sh
curl --fail --show-error --max-time 10 http://127.0.0.1:8080/health
curl --fail --show-error --max-time 30 http://127.0.0.1:8080/the8020/demo/static/
```

Service URLs are `/<namespace>/<package>/<service>/<relative-route>`. The demo
example requires that package and service to be active; replace it with your
target route and assert the changed behavior, not just HTTP 200. `/health` only
proves kernel readiness. Authenticated services require a valid application
login cookie or token; the activation token does not authorize them. Never log
credentials or copy host secrets into packages.

Source publication replaces affected service generations. Existing persistent
connections can remain on old code; create a fresh logical session to test the
new generation. Reconnecting an old session can still select its old Worker.
Browser assets may need a package build and browser reload; asset reads alone
are not tracked imports. Report what was activated and actually tested, with any
remaining limitation.
