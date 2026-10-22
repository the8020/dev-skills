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
  example before creating one. Package `deno.json` files own dependencies and
  tasks; `/workspace/deno.json` supplies shared platform imports.
- Cross-package imports use `/p/<namespace>/<package>/<file>.ts`. The running
  Worker resolves `/p/` to the activated package tree. `@the8020/kernel` and
  `@the8020/context` are generic runtime APIs. HTTP helpers live in
  `/p/the8020/services/http.ts`; shared Zod and Kysely live in `the8020/db`.
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
  ordinary program running on the kernel. For direct SQL, use the authenticated
  `sql` helper described in [the8020-dev-db](../the8020-dev-db/SKILL.md).

## Route to the needed skill

Resolve these skill names through the agent catalog so custom overrides apply.
The links below point to the shipped versions.

| Work                                                                               | Read                                                           |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Shared Zod fields, structures, labels/help, value representation                   | [the8020-dev-types](../the8020-dev-types/SKILL.md)             |
| Tables, Kysely, sandbox SQL commands, SQL results, schema activation               | [the8020-dev-db](../the8020-dev-db/SKILL.md)                   |
| Programs, positional inputs, interactive/background invocation, jobs and schedules | [the8020-dev-programs](../the8020-dev-programs/SKILL.md)       |
| HTTP/WebSocket services, access policy, runtime testing and reload                 | [the8020-dev-services](../the8020-dev-services/SKILL.md)       |
| UUI forms, lists, UI copy, field help, navigation, browser assets                  | [the8020-dev-uui](../the8020-dev-uui/SKILL.md)                 |
| Operate or inspect live UUI screens without a browser                              | [the8020-dev-uui-control](../the8020-dev-uui-control/SKILL.md) |

Permissions follow [Authorization](#authorization) below. For authentication,
package administration, or another domain, start with its owning package's
`AGENTS.md`. Load the types skill when shared definitions change, then the
relevant consumer skill; do not load unrelated domain skills.

## Authorization

Application authorization is opt-in and owned by `the8020/auth`; its `AGENTS.md`
has the exact matching rules.

- Declare every action your package checks in its `declarations/auth.toml`.
  Quoted keys map to a description that states what the checked value is, or to
  a table that also sets `audit`:

  ```toml
  "deep.dlis.einvoice.view" = "View e-invoices; value is the invoice's channel."
  "deep.dlis.einvoice.approve" = { description = "Approve e-invoices; value is the channel.", audit = true }
  "deep.dlis.settings.edit" = { description = "Change DLIS settings; value is empty.", value = false }
  ```

  Mark actions checked with `""` as `value = false`; the role editor then grants
  them as a whole instead of asking for values.

  Role editors offer declarations as value help, Home requires them for
  `[visible]`, and audit flags come only from them, so never skip one.
- Name actions `<namespace>.<package>.<entity>.<verb>`, the package ID with a
  dot (`deep/dlis` → `deep.dlis.einvoice.approve`, `the8020/users` →
  `the8020.users.user.edit`). Use `view`, `edit`, `create`, `delete` or a
  specific verb such as `approve`. "admin" is a role, not a verb. Patterns such
  as `deep.dlis.*` belong in roles, not declarations. The value is one string:
  what access is restricted by (channel, country, company code, username,
  `namespace/package`) or `""` for a package-wide action. Keep values stable.
- Enforce at the operation's owner, usually the package's shared `src/admin.ts`
  API that programs, screens and commands all call, before any mutation **and
  before reading** data (`….view`):

  ```ts
  import { requirePermission } from "/p/the8020/auth/mod.ts";

  await requirePermission("deep.dlis.einvoice.approve", invoice.channel);
  ```

  It throws `AuthorizationError` (`forbidden`). `check(action, value)` returns a
  boolean for decisions inside an operation. Both record denials, so never call
  them to filter lists, menus or tiles. In a UUI program, turn an entry denial
  into a `sendMessage` and return instead of letting the program crash.
- Lists, menus and pickers use the unaudited queries with the trusted
  `context.username`:
  - `sqlPredicate(username, action, column)` returns a Kysely condition, so a
    list filters in SQL:
    `.where(await sqlPredicate(context.username, VIEW, "channel"))`;
  - `filter(username, rows, { channel: VIEW })` filters loaded rows;
  - `verify(username, action, value)` answers one value;
  - `permitsAny(username, action)` says whether any value is granted (menus);
  - `usersWithPermission(action, value)` lists enabled accounts granted the
    value, e.g. who to ask for an approval.
- A self-service exception compares the trusted identity, never a caller
  argument:

  ```ts
  if (!context.authenticated || context.username !== username) {
    await requirePermission("the8020.users.user.edit", username);
  }
  ```
- **Attributes** let one role serve many users with different values. A role
  entry names an attribute instead of values, and each assignment supplies the
  values:

  ```toml
  # declarations/auth-attributes.toml
  "deep.dlis.channel" = "Invoice channel; values are channel codes such as SK."
  ```

  Grant with `auth.roles.grant <role> <action> deep.dlis.channel --attribute`
  and assign with
  `auth.users.assign novak <role> --attribute
  deep.dlis.channel=SK,CZ`. Values
  belong to that assignment and flow into included roles; an unbound attribute
  grants nothing.
- **Declared roles** ship with the package in `declarations/auth-roles.toml`;
  names start with the package prefix:

  ```toml
  ["deep.dlis.viewer"]
  description = "View e-invoices in your channels."
  permissions = { "deep.dlis.einvoice.view" = { attribute = "deep.dlis.channel" } }

  ["deep.dlis.user"]
  description = "E-invoice user."
  collection = true
  includes = ["deep.dlis.viewer"]
  ```

  Package indexing creates and updates them; they are read-only in the editor
  (copy one to customize it, then review and adopt template changes). Removed
  roles still in use become obsolete. Platform roles are
  `the8020.users.administrator` (`*` → `*`, given to the bootstrap user) and
  `the8020.users.user` (a collection for application roles).
- **Home tiles**: `widgets/<name>.toml` may set
  `[visible] permission =
  "<declared action>"`; only users granted it for some
  value see the tile, and Home checks again on click. `the8020/*` tiles must
  declare `[visible]` (`public = true` for intentionally public ones). Hiding is
  never enforcement.
- **Audit**: successful checks are recorded for platform operations other than
  `view`; other packages opt in per action with `audit = true`. Denials are
  always recorded. Records are kept for the retention set in Roles → Audit
  (default 30 days). Opt in only for rare or sensitive operations.
- The `system` principal bypasses checks and is never audited. Every user has a
  personal role named after the username plus assigned roles; roles nest and
  only add grants. Manage roles with `the8020/auth/roles` or
  `auth.roles.*`/`auth.users.*`.
- Test both outcomes: a denied user receives `forbidden` with no side effect,
  and a granted role succeeds; for lists, test that rows outside the grant are
  absent.

## Edit, check, activate

1. Inspect each affected repository's status and applicable DOX. Make the change
   at its owner. Run its existing checks (usually `deno task check` and, when
   defined, `deno task test`) and relevant browser/build tasks. The sandbox
   supplies the runtime SDK read-only at `/opt/runtime` and the shared Deno
   workspace at `/workspace/deno.json`. Ordinary tasks inherit platform imports
   while retaining package dependencies; no import-map override is needed. For
   ad hoc checks, run `deno check <files>`. Activation validates schema and runs
   hooks; it does not guarantee a full TypeScript check.
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
4. Check the exit status and result; add `--json` for machine-readable output.
   Conflicts return nonzero (409 maps to exit 3); shared code has not
   necessarily changed. Inspect returned package errors and conflict paths,
   resolve using the owning workflow, preview, and retry. Never reset/discard
   private work or force Git history to make it pass.

Activation preserves the sandbox, running agents, and named terminals. Private
source persists across sandbox loss without a checkpoint timer. Untouched paths
follow shared updates; private edits keep their originals for Git conflict
resolution. Activation publishes its captured changes and preserves later edits.

## Verify the live result

Use `DEVELOPMENT_SYSTEM_URL` for the host node's HTTP base URL from this
sandbox. `/workspace/AGENTS.md` explains its host-network address, start-time
lifetime, and discovery on older kernels. The activation endpoint in
`DEVELOPMENT_ACTIVATION_ENDPOINT` is a separate private control listener.

```sh
curl --fail --show-error --max-time 10 "${DEVELOPMENT_SYSTEM_URL:?}/health"
curl --fail --show-error --max-time 30 "${DEVELOPMENT_SYSTEM_URL:?}/the8020/demo/static/"
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
