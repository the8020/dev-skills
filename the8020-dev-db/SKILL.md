---
name: the8020-dev-db
description: Develop 80|20 database tables and Kysely queries; adapt shared fields to SQL, diagnose logical value conversion, and verify schema changes through package activation. Use with 8020-dev for database work.
---

# Database development

Use [8020-dev](../8020-dev/SKILL.md) for the sandbox and activation workflow.
Read `/workspace/packages/the8020/db/AGENTS.md`, the affected package's DOX, and
the relevant `db/src/AGENTS.md` or `db/types/AGENTS.md` before edits.

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
  stored and returned values; a shell Deno process has no live database bridge.

Database browsing, SQL, comparison, and synchronization screens belong to
`the8020/admin-db`; their presentation is separate from the `the8020/db` driver
and the kernel's physical database authority.
