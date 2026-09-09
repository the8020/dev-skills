---
name: the8020-dev-uui-control
description: Explore and operate real 80|20 UUI screens from a development sandbox without a browser. Use for UI configuration, testing screens, and handing a session to the user.
---

# Operate UUI screens

Use `uui` in the sandbox. Its script is
`/workspace/skills/builtin/the8020-dev-uui-control/scripts/uui.ts` and can also
be run with `deno run -A`. No browser, password, or background process is
needed. It signs in as the sandbox owner using the native sandbox endpoint and
an ordinary users allowance, kept in a private file. Never print credentials.

```sh
uui new the8020/demo/demo-form
uui screen
uui set primary-email 'avery@example.com'
uui value-help role viewer
uui set role viewer
uui set source/value --file /tmp/example.ts
uui click save
uui sessions
uui attach uis-...
uui url
```

Read `screenCall` to find the actual program source. Fields and buttons use
their displayed IDs, including `component/input` for custom components. Bindings
and event names are handled by UUI. `set` treats its argument as text; use
`--json` for booleans, numbers, arrays, or objects. `value-help` searches
choices directly; it does not open the field-help modal.

`list ID --search TEXT --page N --page-size N` changes a list; `select ID INDEX`
selects the displayed row index. `enter ID`, `back`, and `click ID` use the
ordinary screen events. For an unusual custom event only, inspect the source
first, then use `event NAME --id ID --json VALUE`.

Every screen command returns the current transcript. Revisions are tracked
automatically. A stale command makes no change and returns a refreshed
transcript. Review it, then retry; `--force` permits an intervening redraw of
the same screen. It never bypasses read-only fields, validation, or a different
screen instance. A `busy` result means the program is still working: use
`screen` to inspect later, without repeating an action whose outcome is unknown.

Each command briefly takes control, then releases it. A displaced browser is
blurred and reconnects when control returns; it can also explicitly take
control. Detached sessions expire after the normal UUI grace period. `url`
prints the URL to open this same live execution in a browser; use the
deployment's public origin when the sandbox's loopback origin is not reachable
by the user. The user's own Open sessions screen also offers Connect.

Use `--state PATH` for independent CLI sessions (default `~/.the8020/uui.json`).
`auth` explicitly exchanges a fresh allowance; revoked credentials fail rather
than silently signing in again. Expired credentials refresh when needed. Outside
a sandbox, set `UUI_URL` and `UUI_TOKEN` to a remote-capable user token. Operate
only within the user's requested work; UI access is the user's full account
authority. Terminal components currently have no agent fallback.
