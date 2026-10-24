#!/usr/bin/env -S deno run --allow-env=DEVELOPMENT_ACTIVATION_ENDPOINT,DEVELOPMENT_ACTIVATION_TOKEN,DEVELOPMENT_USER_ID --allow-net

async function main() {
  if (Deno.args[0] === "--help") {
    console.log(
      'Usage: kernel-logs [\'<query JSON>\']\nDefault: {"tail":true,"limit":100}. Returns {node_id,page}; text is a case-sensitive message/attribute search. Repeat filters with page.cursor to continue.',
    );
    return;
  }
  if (Deno.args.length > 1) throw new Error("Expected one JSON query");
  const query: unknown = JSON.parse(
    Deno.args[0] ?? '{"tail":true,"limit":100}',
  );
  if (!query || typeof query !== "object" || Array.isArray(query)) {
    throw new Error("Query must be a JSON object");
  }
  const endpoint = Deno.env.get("DEVELOPMENT_ACTIVATION_ENDPOINT");
  const token = Deno.env.get("DEVELOPMENT_ACTIVATION_TOKEN");
  const user = Deno.env.get("DEVELOPMENT_USER_ID");
  if (!endpoint || !token || !user) {
    throw new Error(
      "kernel-logs is available only inside a development sandbox",
    );
  }
  const response = await fetch(
    `${endpoint.replace(/\/$/, "")}/v1/development/sandboxes/${
      encodeURIComponent(user)
    }/logs`,
    {
      method: "POST",
      redirect: "error",
      signal: AbortSignal.timeout(35_000),
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(query),
    },
  );
  const body = (await response.text()).trim();
  if (!response.ok) {
    throw new Error(`Logs failed (${response.status}): ${body}`);
  }
  console.log(body);
}

if (import.meta.main) {
  await main().catch((error) => {
    console.error(error.message);
    Deno.exitCode = 1;
  });
}
