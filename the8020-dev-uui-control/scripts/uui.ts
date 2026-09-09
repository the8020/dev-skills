#!/usr/bin/env -S deno run -A

type State = {
  sessionId: string;
  route?: string;
  expected?: Record<string, unknown>;
};
type Result = {
  sessionId?: string;
  expected?: Record<string, unknown>;
  transcript?: string;
  error?: string;
  busy?: boolean;
  ended?: boolean;
  messages?: Array<{ level: string; message: string }>;
  result?: unknown;
};

function argumentsFor(args: string[]) {
  const flags = new Map<string, string>();
  const values: string[] = [];
  for (let index = 0; index < args.length; index++) {
    const arg = args[index]!;
    if (!arg.startsWith("--")) values.push(arg);
    else if (arg === "--force" || arg === "--help") flags.set(arg, "true");
    else {
      const value = args[++index];
      if (value === undefined) throw new Error(`Missing value for ${arg}`);
      flags.set(arg, value);
    }
  }
  return { flags, values };
}

async function readJSON<T>(path: string): Promise<T | undefined> {
  try {
    return JSON.parse(await Deno.readTextFile(path));
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) return undefined;
    throw error;
  }
}

async function main() {
  const { flags, values } = argumentsFor(Deno.args);
  const [op = "screen", id, value] = values;
  if (flags.has("--help")) {
    console.log(
      "uui new [PROGRAM] | attach SESSION | sessions | screen | set FIELD VALUE [--json VALUE | --file PATH] | click BUTTON | enter FIELD | value-help FIELD [SEARCH] | list LIST [--search TEXT --page N --page-size N] | select LIST INDEX | back | event NAME [--id ID --json VALUE] | url | auth\nOptions: --state PATH --force",
    );
    return;
  }
  const directory = `${Deno.env.get("HOME") ?? "/root"}/.the8020`;
  await Deno.mkdir(directory, { recursive: true, mode: 0o700 });
  const statePath = flags.get("--state") ?? `${directory}/uui.json`;
  const credentialPath = `${directory}/allowance.json`;
  const endpoint = Deno.env.get("DEVELOPMENT_ACTIVATION_ENDPOINT");
  const nativeToken = Deno.env.get("DEVELOPMENT_ACTIVATION_TOKEN");
  const sandboxUser = Deno.env.get("DEVELOPMENT_USER_ID");
  const url = Deno.env.get("UUI_URL") ?? Deno.env.get("DEVELOPMENT_SYSTEM_URL");
  if (!url) throw new Error("UUI_URL or DEVELOPMENT_SYSTEM_URL is required");
  const native = !Deno.env.get("UUI_TOKEN") && endpoint && nativeToken;
  async function nativeCall(
    operation: string,
    body: unknown,
  ): Promise<Response> {
    if (!endpoint || !nativeToken || !sandboxUser) {
      throw new Error("Sandbox native access is unavailable");
    }
    return await fetch(
      `${endpoint.replace(/\/$/, "")}/v1/development/sandboxes/${
        encodeURIComponent(sandboxUser)
      }/${operation}`,
      {
        method: "POST",
        redirect: "error",
        signal: AbortSignal.timeout(35_000),
        headers: {
          authorization: `Bearer ${nativeToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );
  }
  let token = Deno.env.get("UUI_TOKEN");
  if (native) {
    let credential = await readJSON<{ token: string; expiresAt: string }>(
      credentialPath,
    );
    if (
      op === "auth" || credential === undefined ||
      Date.parse(credential.expiresAt) <= Date.now()
    ) {
      const response = await nativeCall("token", {});
      if (!response.ok) {
        throw new Error(`Sandbox sign-in failed (${response.status})`);
      }
      credential = await response.json();
      if (
        !credential || typeof credential.token !== "string" ||
        !Number.isFinite(Date.parse(credential.expiresAt))
      ) throw new Error("Invalid allowance response");
      await Deno.writeTextFile(credentialPath, JSON.stringify(credential), {
        mode: 0o600,
      });
    }
    token = credential.token;
  }
  if (!token) throw new Error("Sandbox access or UUI_TOKEN is required");
  if (op === "auth") {
    console.log("Signed in.");
    return;
  }
  async function request(
    serviceId: string,
    path: string,
    body?: unknown,
    route?: string,
  ): Promise<Response> {
    const method = body === undefined ? "GET" : "POST";
    const headers: Record<string, string> = {
      "the8020-authorization": `Bearer ${token}`,
      "content-type": "application/json",
      ...(route ? { "the8020-route": route } : {}),
    };
    const encoded = body === undefined ? undefined : JSON.stringify(body);
    if (native) {
      const response = await nativeCall("request", {
        serviceId,
        method,
        path,
        headers,
        body: encoded ?? "",
      });
      if (!response.ok) {
        throw new Error(`Native service request failed (${response.status})`);
      }
      const result = await response.json();
      const responseHeaders = new Headers();
      for (
        const [name, values] of Object.entries(
          result.headers as Record<string, string[]>,
        )
      ) for (const value of values) responseHeaders.append(name, value);
      return new Response(
        [204, 304].includes(result.status_code) ? null : result.body,
        { status: result.status_code, headers: responseHeaders },
      );
    }
    return await fetch(new URL(`/${serviceId}${path}`, url), {
      method,
      headers,
      body: encoded,
      redirect: "manual",
      signal: AbortSignal.timeout(35_000),
    });
  }
  if (op === "sessions") {
    const response = await request("the8020/uui/shell", "/sessions");
    if (!response.ok) {
      throw new Error(`Session listing failed (${response.status})`);
    }
    console.log(JSON.stringify(await response.json(), null, 2));
    return;
  }
  let state = await readJSON<State>(statePath);
  if (op === "new") {
    const response = await request("the8020/uui/session", "/connect", {
      ...(id ? { program: id } : {}),
      ...(flags.has("--json")
        ? { inputs: JSON.parse(flags.get("--json")!) }
        : {}),
    });
    const sessionId = response.headers.get("the8020-session");
    if (!response.ok || !sessionId) {
      throw new Error(`Session creation failed (${response.status})`);
    }
    state = { sessionId };
  } else if (op === "attach") {
    if (!id) throw new Error("attach requires a session ID");
    state = { sessionId: id };
  }
  if (!state) throw new Error("Use uui new or uui attach SESSION first");
  if (op === "url") {
    console.log(
      new URL(
        `/the8020/uui/shell/?session=${encodeURIComponent(state.sessionId)}`,
        url,
      ).href,
    );
    return;
  }
  const command: Record<string, unknown> = { op };
  if (["new", "attach"].includes(op)) command.op = "screen";
  else if (
    ["set", "click", "enter", "value-help", "list", "select"].includes(op)
  ) {
    if (!id) throw new Error(`${op} requires an element ID`);
    command.id = id;
    if (op === "set") {
      command.value = flags.has("--file")
        ? await Deno.readTextFile(flags.get("--file")!)
        : flags.has("--json")
        ? JSON.parse(flags.get("--json")!)
        : value;
      if (command.value === undefined) throw new Error("set requires a value");
    }
    if (op === "value-help") command.search = value ?? "";
    if (op === "select") command.index = Number(value);
    if (op === "list") {
      for (
        const [flag, key] of [["--search", "search"], ["--page", "page"], [
          "--page-size",
          "pageSize",
        ]]
      ) {
        if (flags.has(flag!)) {
          command[key!] = key === "search"
            ? flags.get(flag!)
            : Number(flags.get(flag!));
        }
      }
    }
  } else if (op === "event") {
    command.action = id;
    if (flags.has("--id")) command.id = flags.get("--id");
    if (flags.has("--json")) command.value = JSON.parse(flags.get("--json")!);
  } else if (!["screen", "back"].includes(op)) {
    throw new Error(`Unknown command: ${op}`);
  }
  const clientId = crypto.randomUUID();
  const claim = await request("the8020/uui/shell", "/control", {
    sessionId: state.sessionId,
    clientId,
    operation: "claim",
    takeover: true,
  });
  if (!claim.ok) {
    throw new Error(
      `Session control unavailable (${claim.status}); no action was sent`,
    );
  }
  const control = await claim.json();
  if (!control.active || !control.route) {
    throw new Error("Could not take session control");
  }
  let result: Result;
  try {
    const response = await request("the8020/uui/session", "/command", {
      clientId,
      control: control.control,
      expected: state.expected,
      force: flags.has("--force"),
      command,
    }, control.route);
    if (!response.headers.get("content-type")?.includes("application/json")) {
      throw new Error(
        `Screen request failed (${response.status}); inspect before repeating an action`,
      );
    }
    result = await response.json();
  } finally {
    // Also releases a claim if dispatch failed before reaching the session.
    await request("the8020/uui/shell", "/control", {
      sessionId: state.sessionId,
      clientId,
      operation: "release",
    }).catch(() => undefined);
  }
  state.expected = result.expected;
  state.route = control.route;
  await Deno.writeTextFile(statePath, JSON.stringify(state), { mode: 0o600 });
  console.log(result.transcript ?? "No screen available");
  if (result.result !== undefined) {
    console.log(JSON.stringify(result.result, null, 2));
  }
  if (result.busy) console.log("busy: true");
  if (result.ended) console.log("ended: true");
  for (const message of result.messages ?? []) {
    console.log(`${message.level}: ${message.message}`);
  }
  if (result.error) {
    console.error(result.error);
    Deno.exitCode = 1;
  }
}

if (import.meta.main) {
  await main().catch((error) => {
    console.error(error.message);
    Deno.exitCode = 1;
  });
}
