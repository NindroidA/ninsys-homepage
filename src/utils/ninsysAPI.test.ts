import { afterAll, describe, expect, test } from "bun:test";

// ninsysAPI imports apiBase, which reads window.location when it loads, and Bun
// has no window. Stand in a minimal one before the dynamic import below.
const g = globalThis as { window?: unknown };
const hadWindow = "window" in g;
g.window ??= { location: { hostname: "localhost" } };
afterAll(() => {
  if (!hadWindow) delete g.window;
});

const { describeError } = await import("./ninsysAPI");

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("describeError", () => {
  test("uses the server's error message with the status code", async () => {
    const response = jsonResponse({ error: "Invalid TOTP code" }, 401);
    expect(await describeError(response)).toBe("Invalid TOTP code (401)");
  });

  test("falls back to the message field", async () => {
    const response = jsonResponse({ message: "Project not found" }, 404);
    expect(await describeError(response)).toBe("Project not found (404)");
  });

  test("prefers error over message when both are set", async () => {
    const response = jsonResponse({ error: "Rate limited", message: "Slow down" }, 429);
    expect(await describeError(response)).toBe("Rate limited (429)");
  });

  test("falls back to the bare status for a non-JSON or empty body", async () => {
    const html = new Response("<h1>502 Bad Gateway</h1>", { status: 502 });
    expect(await describeError(html)).toBe("API Error: 502");
    expect(await describeError(new Response(null, { status: 500 }))).toBe("API Error: 500");
  });

  test("falls back to the bare status when there is no usable message", async () => {
    expect(await describeError(jsonResponse({ error: { code: "E_BAD" } }, 400))).toBe(
      "API Error: 400",
    );
    expect(await describeError(jsonResponse({ error: "" }, 400))).toBe("API Error: 400");
    expect(await describeError(jsonResponse(null, 400))).toBe("API Error: 400");
  });

  test("leaves the original response body unread", async () => {
    const response = jsonResponse({ error: "Forbidden" }, 403);
    await describeError(response);
    expect(response.bodyUsed).toBe(false);
    expect(await response.json()).toEqual({ error: "Forbidden" });
  });
});
