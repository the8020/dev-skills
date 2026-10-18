---
name: the8020-dev-db
description: Develop 80|20 database tables and Kysely queries, run SQL from a development sandbox, diagnose logical value conversion, and verify schema changes through package activation. Use with 8020-dev for database work.
---

# Database development

Use [8020-dev](../8020-dev/SKILL.md) for the sandbox and activation workflow.
Read `/workspace/packages/the8020/db/AGENTS.md`, the affected package's DOX, and
the relevant `db/src/AGENTS.md` or `db/types/AGENTS.md` before edits.

## Run SQL from the sandbox

Use the installed `sql` helper; it authenticates with the sandbox's existing
native token, without a password or database connection setup.

```sh
sql 'SELECT $1 AS value' --parameters '[7]'
sql 'SELECT id, name FROM the8020__demo__customers ORDER BY id LIMIT 20'
sql --execute 'UPDATE the8020__demo__customers SET name = $1 WHERE id = $2' --parameters '["Alice", "customer-id"]'
```

- Output is JSON: queries return `columns`, positional `rows`, and `truncated`;
  `--execute` selects non-row-returning SQL and returns `rows_affected`. Query
  mode is not read-only; `RETURNING` mutations can return rows.
- `--parameters` is a JSON array of scalar values. Use bound values and the
  active backend's SQL syntax. Parameters and output retain native integer
  precision; raw results are engine values, without semantic field codecs.
- SQL runs against the shared live system database, independently of private
  source edits or activation. Keep reads bounded and writes targeted to the
  requested work. The kernel enforces its existing result limits and a 30-second
  deadline. A failure exits nonzero; do not automatically retry writes after a
  timeout or lost response because they may have committed.
- The helper provides native administrative SQL through a running development
  sandbox's ingress without executing an application package. Continue to use
  table source and activation for schema changes; this access does not authorize
  bypassing their workflow.
- The thin platform helper delegates to [scripts/sql.ts](scripts/sql.ts). It
  needs a kernel with the sandbox SQL bridge and the activated dev-skills
  script. It does not expose a general Worker bridge to shell processes.

## Tables and package queries

- The owning package's `tables/<name>.ts` default-exports one `table()` object.
  Its ID is `<namespace>__<package>__<table>` after the owner's normalization.
  Follow existing naming rules and type augmentation; for a complete example,
  read `/workspace/packages/the8020/demo/tables/customers.ts`.
- Import `table`, `t`, `db`, and `transaction` from `/p/the8020/db/mod.ts`.
  [the8020-dev-types](../the8020-dev-types/SKILL.md) owns shared field and
  structure definitions. Here, `t.from(field)` and `columns(structure)` adapt
  them to storage; SQL keys, defaults, nullability, and generation remain
  explicit table decisions.
- Use ordinary Kysely builders and bounded queries. Table helpers return normal
  builders after the first call. Use the existing bounded `transaction()` API
  when atomicity is needed; do not open backend connections from packages.
- Booleans, dates, JSON, bytes, and decimal strings cross the shared descriptor
  and codec boundary. Diagnose a wrong value through that boundary; do not add
  casts, JSON parsing, or date coercions in each screen or service. Exact money
  uses the shared decimal/string contract, not floating-point arithmetic.
- Table source is the schema authority. Editing it does not immediately alter
  the database: activation validates affected tables and synchronizes schema
  before publishing sources. Do not hand-edit the database catalog, use ad hoc
  DDL, or connect directly to the host's SQLite file to bypass a failed schema
  change. Inspect synchronization errors and preserve existing data.
- Run the affected package checks and a root-cause regression for nontrivial
  logic. When changing the shared DSL/codec, run `the8020/db` checks/tests too.
  After activation, exercise the relevant service or UUI path and verify both
  stored and returned values. Use `sql` for direct database inspection; ordinary
  shell Deno processes still have no Worker bridge.

Database browsing, SQL, comparison, and synchronization screens belong to
`the8020/admin-db`; their presentation is separate from the `the8020/db` driver
and the kernel's physical database authority.

## Evolve an existing table

Enum widening and enum-to-text preserve data automatically. Preview uses
metadata only: `activate --preview --schema --package namespace/package`.
Backend DDL can still scan, copy or lock rows. No mandatory pre/post application
data analysis or replacement-population callback runs.

Export optional `async migrate(ctx)` from the table file for selective cleanup.
`MigrationContext` in `/p/the8020/db/mod.ts` supplies `table`, `previous`,
`next`, `activationId` and old-schema transaction-bound Kysely `tx`. Guard
supported old schemas and author ordinary targeted SQL updates/deletes. Cleanup
must fit the old types/checks; numeric storage cannot be updated directly to
business labels. Do not infer business mappings, patch catalogs or run ad hoc
DDL. The DB owner attempts its documented native conversions and enforces target
constraints. Unsupported cases need an explicit staged column/table change or
must stop.

Cleanup, DDL and catalog effects roll back together on failure. There is no
universal row/key preservation scan preventing intentional authored cleanup.
Fresh/unchanged/known-safe definitions and function-code-only edits skip the
hook. Keep it while its old-schema paths are supported. Use only supplied `tx`,
with no remote/filesystem/email or independently committed effects: pre-commit
failures may retry it.

`activate --package namespace/package --message '…' --force table-id.column`
authorizes only incompatible cells in that exact column to use NULL when legal
or the authored valid target default. Repeat for additional exact columns.
Normal cleanup/native activation runs first; force requires confirmed rollback.
Good cells, unrelated columns, rows, keys, retired data and identities stay.
Required, unique, key/reference or unsupported repairs may stop; missing
implementation or an unknown/timeout/lock error never justifies clearing a
table. No silent whole-column/table-loss escalation is implemented. UI approval
binds the same candidate and maximum column damage; production needs
target-local consent. After SQL commit, resume the same candidate forward after
hook/source/index failure, without replaying cleanup/repair or claiming source
rollback restored data. Native transport/SDK and db capability must match before
schema mutation.
