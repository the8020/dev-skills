---
name: the8020-dev-types
description: Define and reuse 80|20 semantic Zod fields and structures across validation, database tables, services, and UUI forms/lists. Use for shared field meaning, labels, help, references, and logical storage representation.
---

# Shared fields and structures

Use [8020-dev](../8020-dev/SKILL.md) for the development workflow. Read the
owning package's DOX and `/workspace/packages/the8020/db/AGENTS.md` for the
shared field contract. `db/fields.ts` supplies the runtime-independent API;
domain definitions belong to the package that owns their meaning.

## Define meaning once

- Search existing owner-defined fields before adding one. A program reference
  belongs to `the8020/packages`, a username to `the8020/users`, and a job
  reference to `the8020/jobs`. Import their definitions rather than declaring
  another string field in each table or screen.
- Use ordinary Zod schemas, with `field` and `z` imported from
  `/p/the8020/db/fields.ts`. This entrypoint does not initialize the database
  driver or require the HTTP/UUI runtime. `types/` is a useful convention, not a
  required location or a separate central types package.
- Apply validation constraints before attaching field metadata.
  `field(schema,
  metadata)` returns an independent schema; customizing a use
  must not mutate the owner. Supply useful `label` and Markdown `description`,
  with `valueHelp` and `open` callbacks for entity references when applicable.
- Structures are ordinary `z.object()` schemas. Compose through `.shape`,
  `.pick()`, `.extend()`, and `.array()`, and derive TypeScript types with
  `z.infer`. Reuse the actual schemas across layers, not just matching TS
  interfaces. Do not introduce a structure registry or wrapper DSL.
- Optional, nullable, default, catch, and readonly wrappers preserve field
  metadata under the shared contract. New refinements/clones follow Zod's
  presentation-metadata rules; attach or customize help after constraining the
  final schema. Do not assume every transform preserves the original meaning.

For concrete examples, read `/workspace/packages/the8020/demo/src/fields.ts`
(structure composition) and
`/workspace/packages/the8020/packages/types/program.ts` (shared reference,
searchable help, and navigation).

## Connect the consumers

| Concern                                                                | Owner                                                            |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Validation, labels, descriptions, reference help, value representation | Semantic field in its domain package                             |
| SQL keys, defaults, generation, indexes and queries                    | Table/query; [the8020-dev-db](../the8020-dev-db/SKILL.md)        |
| Placement, editability, visibility, modal/keyboard behavior            | Screen/framework; [the8020-dev-uui](../the8020-dev-uui/SKILL.md) |

- Optional `storage` metadata declares an unambiguous logical SQL representation
  once on the field, checked against its Zod output type. `t.from(field)` and
  `columns(structure)` consume it; contradictory column overrides fail.
  Transforms replacing a schema need a new explicit storage decision. Zod
  validation refinements and defaults are not SQL constraints or defaults. Leave
  physical encoding to the shared database codecs.
- `decimal(precision, scale)` and `money()` are exact decimal-string fields;
  currency is a separate domain concept. Reuse them instead of floating-point
  amounts or repeated storage declarations.
- Value help receives a list query plus offset/limit and returns an ordered Zod
  object schema, rows, and paging information. The first field is the key; the
  remaining columns use semantic fields too. Apply search/filter/sort before
  paging. Reuse the existing SQL lookup or bounded in-memory list helper as
  appropriate to the data source.
- Keep imports safe for table evaluation: defining a field must not query the
  database, load a screen, or require an active invocation. Load runtime/UUI
  dependencies inside `valueHelp`/`open` callbacks when needed; callbacks stay
  server-side and never enter SQL descriptors.

When changing a shared field, trace its table, validation, and UUI consumers.
Run the owner's checks and affected consumer checks; verify the relevant
validation, stored/returned value, label/help, and selection behavior. Fix lost
metadata or conversion defects at the shared owner instead of copying metadata
or adding coercions in each consumer.
