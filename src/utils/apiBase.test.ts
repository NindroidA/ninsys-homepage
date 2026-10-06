import { afterAll, describe, expect, test } from "bun:test";

// apiBase.ts reads window.location.hostname once, when it is first imported, and
// Bun has no window. Each case stubs one and imports a fresh copy of the module:
// the query string gives it a new module key, so a cached copy can't leak in.
const g = globalThis as { window?: unknown };
const hadWindow = "window" in g;
const originalWindow = g.window;

afterAll(() => {
  if (hadWindow) {
    g.window = originalWindow;
  } else {
    delete g.window;
  }
});

async function apiBaseOn(hostname: string): Promise<string> {
  g.window = { location: { hostname } };
  const mod = (await import(`./apiBase.ts?hostname=${hostname}`)) as typeof import("./apiBase");
  return mod.API_BASE;
}

describe("API_BASE", () => {
  test("uses the local API when the page is served from localhost", async () => {
    expect(await apiBaseOn("localhost")).toBe("http://localhost:3001");
  });

  test("uses the production API on any other host", async () => {
    expect(await apiBaseOn("nindroidsystems.com")).toBe("https://api.nindroidsystems.com");
    expect(await apiBaseOn("www.nindroidsystems.com")).toBe("https://api.nindroidsystems.com");
  });
});
