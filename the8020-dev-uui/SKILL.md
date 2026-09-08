---
name: the8020-dev-uui
description: Develop 80|20 UUI programs, forms, lists, semantic field help, and package-owned browser assets. Use with 8020-dev for screen behavior, navigation, and browser verification.
---

# UUI development

Use [8020-dev](../8020-dev/SKILL.md) for the edit/activation/live-test workflow.
Read the affected package's program DOX and
`/workspace/packages/the8020/uui/AGENTS.md`. For browser behavior also read
`uui/services/shell/frontend/AGENTS.md` beneath the packages namespace.

- [the8020-dev-programs](../the8020-dev-programs/SKILL.md) owns program
  manifests and invocation. UUI programs declare `uui = true`; Home also
  requires `discoverable = true`. Inspect `the8020/demo/programs/demo-form/` and
  `demo-master-detail/` for working examples. Use ordinary programs, not a new
  service per screen.
- Build with the UUI package's existing Model, screen, form, list, and layout
  contracts. Retain Model wrappers while refreshing business data. Compose
  owner-defined Zod fields/structures from
  [the8020-dev-types](../the8020-dev-types/SKILL.md); screens own placement and
  editability. Use [the8020-dev-db](../the8020-dev-db/SKILL.md) when
  storage/query semantics change.
- Keep practical information and common actions first; put internals in advanced
  views. Link related entities through their owning UUI programs. Use the shared
  Back event and header actions, existing responsive field geometry, and normal
  searchable/sortable typed list queries.
- Field help uses the shared modal, bound value, Markdown help, searchable value
  help, and existing pencil/Chevron and F1/F4 behavior. Do not implement help or
  focus handling separately in each program.
- Custom elements are generic wrappers. Programs own their browser code,
  dependencies, and assets; keep them in the providing package and load them
  only when requested. Follow that package's build task before activation.
- Fix rendering, keyboard/focus, and logical-value defects in their shared owner
  after tracing the screen-to-browser flow. Preserve accessibility and existing
  keyboard behavior rather than adding screen-specific workarounds.

Run the existing package checks and focused browser harness. After activation,
open the actual program through the authenticated shell at
`/the8020/uui/shell/`, start a new logical UUI session for updated Worker code,
and exercise the affected interaction. A refresh/reconnect can retain an old
session. Browser assets may require rebuilding and reloading separately. Verify
relevant navigation, editing, validation, keyboard/focus, and responsive
behavior; screenshots alone do not prove interactive behavior.
