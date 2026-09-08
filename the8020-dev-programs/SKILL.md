---
name: the8020-dev-programs
description: Develop 80|20 programs and jobs, including program manifests, positional inputs, interactive invocation, background execution, UTC schedules, durable run history, hooks, and events. Use with 8020-dev for executable package workflows.
---

# Programs and jobs

Use [8020-dev](../8020-dev/SKILL.md) for activation and live verification. Read
the owning package's program DOX. For scheduled or durable work, read
`/workspace/packages/the8020/jobs/AGENTS.md` and its relevant child contract.

## Author the program

- A program lives at `programs/<name>/` in its owning package and has the
  canonical ID `<namespace>/<package>/<name>`. `program.toml` declares
  `schema = 1`, a description, an entrypoint such as `program.ts`, and its
  discovery/UI flags. The entrypoint default-exports a callable function.
- Inputs are positional: an argument array is spread into that function.
  Validate untrusted inputs with the owner's ordinary Zod schemas, using
  [the8020-dev-types](../the8020-dev-types/SKILL.md) for reusable fields and
  structures. Return the result; await work that must finish with the invocation
  and propagate failures rather than reporting success after detached work.
- Inspect `/workspace/packages/the8020/jobs/programs/echo/` for a small
  background program. Use `@the8020/context` for trusted execution identity and
  `@the8020/kernel` for platform capabilities inside a Worker. Do not accept an
  input username as proof of the caller's identity.
- Set `uui = true` for interactive programs; Home also requires
  `discoverable = true`. Hidden helpers need not be discoverable to run.
  [the8020-dev-uui](../the8020-dev-uui/SKILL.md) owns screens and interactions.

## Choose the execution path

| Need                                                                      | Existing path                                                                                       |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Open another program in the current UUI session                           | `invokeProgram(id, inputs)` from `/p/the8020/uui/mod.ts`, through the existing page/error boundary  |
| Execute a program in the generic background runtime and await its outcome | `kernel.programs.run({ programId, arguments, username?, sandboxGroup?, timeoutMs? })` from a Worker |
| Queue work or retain durable history; run once or on a calendar           | `jobs` from `/p/the8020/jobs/mod.ts`, or the Jobs administration UI                                 |
| React to an event or participate in activation                            | Ordinary program referenced by the owning package's event or hook declaration                       |

Interactive invocation keeps the current UUI session and user; it does not
create a queued job. Do not send screen programs to background execution to open
UI. `kernel.programs.run` returns a structured outcome: check `state` and
`failure`, then `result`, and retain its execution IDs/log position for useful
diagnostics. This primitive alone does not create durable Jobs history.

Execution by program ID has context type `program`; a direct module invocation
has type `module`, and service execution has type `service`. Reserve the term
job for the package-owned job system; generic runtime job machinery is its
execution mechanism, not a second scheduler or history store.

## Durable and scheduled jobs

- `jobs.submit(input)` persists manual work; `jobs.save(...)` saves a schedule,
  `jobs.runNow(id)` submits a saved schedule immediately, and
  `jobs.runs.list/inspect` reads history. Follow the actual exports and types in
  `jobs/mod.ts` and `jobs/src/types.ts`; use the existing UI/store validation.
- Inputs select a ready program, positional JSON arguments, execution user,
  sandbox group, and `any`, `all`, or `node:<id>`. The jobs package validates
  eligibility. The kernel validates structural principals and execution; it does
  not own account policy. Jobs expose no service-style scaling controls.
- Calendars use UTC, explicit datetimes, and optional recurrence. Minute events
  drive scheduling; sub-minute appointments run on a following tick. Any uses
  one claimed occurrence; All creates independent per-node work. Keep the
  existing bounded batches, short claims, and immutable queued inputs.
- Never hold a database transaction while a program runs. A lost or expired
  execution is `interrupted` with an unknown outcome, not automatically safe to
  replay. Existing jobs finish during source updates; activation must not
  restart/replay them. Application side effects need an explicit idempotency
  contract if retries are part of the requested workflow.
- History owns outcomes and execution references; unified logging owns log
  messages. Read bounded logs on the exact execution's node using its IDs and
  saved log position. Do not copy logs into job rows or scan every Worker.

Flat `events/*.toml` declarations name `event`, `description`, and a full
`program` ID; event emission does not await listener completion. Flat
`hooks/*.toml` declarations name `hook`, `description`, and `program`, with
optional `order`; hook chains are awaited in order. Reuse these contracts rather
than adding timers, cron processes, or bespoke execution sandboxes.

## Verify

Run the affected package checks and focused input/result/failure tests. For
scheduler changes also run the jobs package's existing tests. After activation,
exercise the intended path: interactive navigation for UI, a real program run
for background logic, or a submitted job with observed terminal history for
durable work. Check side effects and failure behavior, not merely successful
submission. A developer-shell `deno run` has no live Worker bridge.
