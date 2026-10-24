#!/usr/bin/env -S deno run --no-config --allow-env=DEVELOPMENT_ACTIVATION_ENDPOINT,DEVELOPMENT_ACTIVATION_TOKEN,DEVELOPMENT_USER_ID --allow-net

async function main() {
  let statement: string | undefined;
  let parameters = "";
  let execute = false;
  for (let index = 0; index < Deno.args.length; index++) {
    const argument = Deno.args[index]!;
    if (argument === "--help" || argument === "-h") {
      console.log(
        "Usage: sql [--execute] [--parameters <json-array>] [--] <statement>\nReturns JSON. Query mode returns columns and rows; --execute returns rows_affected. Both modes can modify shared data.",
      );
      return;
    }
    if (argument === "--execute") execute = true;
    else if (argument === "--") {
      if (statement !== undefined || Deno.args.length !== index + 2) {
        throw new Error("Expected one SQL statement after --");
      }
      statement = Deno.args[++index];
      break;
    } else if (argument === "--parameters") {
      const value = Deno.args[++index];
      if (value === undefined) {
        throw new Error("--parameters requires a JSON array");
      }
      parameters = value;
    } else if (argument.startsWith("-")) {
      throw new Error(`Unknown option: ${argument}`);
    } else if (statement === undefined) statement = argument;
    else throw new Error("Expected one SQL statement");
  }
  if (!statement?.trim()) throw new Error("A SQL statement is required");
  const endpoint = Deno.env.get("DEVELOPMENT_ACTIVATION_ENDPOINT");
  const token = Deno.env.get("DEVELOPMENT_ACTIVATION_TOKEN");
  const user = Deno.env.get("DEVELOPMENT_USER_ID");
  if (!endpoint || !token || !user) {
    throw new Error("sql is available only inside a development sandbox");
  }
  const response = await fetch(
    `${endpoint.replace(/\/$/, "")}/v1/development/sandboxes/${
      encodeURIComponent(user)
    }/sql`,
    {
      method: "POST",
      redirect: "error",
      signal: AbortSignal.timeout(35_000),
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ statement, parameters, execute }),
    },
  );
  const body = (await response.text()).trim();
  if (!response.ok) throw new Error(`SQL failed (${response.status}): ${body}`);
  console.log(body);
}

if (import.meta.main) {
  await main().catch((error) => {
    console.error(error.message);
    Deno.exitCode = 1;
  });
}
