---
name: the8020-dev-services
description: Build and test 80|20 HTTP and WebSocket services, service declarations, authentication, and source-update behavior. Use with 8020-dev when changing service handlers or runtime-facing package behavior.
---

# Service development

Use [8020-dev](../8020-dev/SKILL.md) for activation, network access, and the
current sandbox-reset limitation. Read the owning package's service DOX and
`/workspace/packages/the8020/services/AGENTS.md` for policy and indexing.

- `services/<name>/service.toml` declares a service; its entrypoint belongs to
  that package. Start from `/workspace/packages/the8020/demo/services/static/`
  for HTTP or `demo/services/database/` for a database-backed handler. Read the
  actual declaration before copying its access and lifecycle settings.
- Default-export the service created by `defineService` from `@the8020/http`.
  Register relative routes on that service; the kernel strips the canonical
  `/<namespace>/<package>/<service>` prefix. Reuse ordinary Zod request/response
  schemas and the existing HTTP/OpenAPI helpers. Do not start a separate
  `Deno.serve` listener for an ordinary platform service.
- Use `@the8020/kernel` for platform capabilities and `@the8020/context` for
  immutable trusted invocation identity. Never trust caller-supplied internal
  headers or invent a parallel kernel client from sandbox tokens.
- The services package owns declarations, defaults, operator overrides, and
  effective configuration; the kernel owns routing, execution, and placement.
  Public services execute as their configured principal. Authenticated services
  verify platform credentials and users-package session policy before handling.
  Loopback access does not bypass authentication.
- Keep work bounded and model persistent protocols using the existing service
  lifecycle. Reuse service/job Workers, hooks, and events rather than adding a
  background process or special-purpose sandbox.

After package checks and activation, call the real canonical URL and assert the
changed response, including failure/auth cases relevant to the change. Use a
fresh logical connection/session for updated persistent code. Existing jobs
finish and old connections drain during soft service replacement.
`services.restart <service-id>` requests an explicit soft restart through the
administrative command bus; `--hard` terminates all its generations. These are
platform commands, not executables in the developer shell. Inspect their help
and use the administration UI/command bus when needed.

An authenticated browser can test the ordinary login/shell flow. Keep its
cookies private. A working health endpoint does not prove that your service is
enabled, its handler loaded, its authentication succeeded, or new code ran.
