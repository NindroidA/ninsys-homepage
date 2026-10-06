import { afterAll, afterEach, describe, expect, mock, spyOn, test } from "bun:test";
import type { CogworksStatus, SystemHealth } from "../utils/ninsysAPI";

// useLiveServices -> ninsysAPI -> apiBase, which reads window.location when it
// loads, and Bun has no window. Stand in a minimal one before the dynamic imports.
const g = globalThis as { window?: unknown };
const hadWindow = "window" in g;
g.window ??= { location: { hostname: "localhost" } };
afterAll(() => {
  if (!hadWindow) delete g.window;
});

const { ninsysAPI } = await import("../utils/ninsysAPI");
const { fetchServices, formatUptime } = await import("./useLiveServices");

describe("formatUptime", () => {
  const cases: [seconds: number, expected: string][] = [
    [0, "0m"],
    [59, "0m"],
    [60, "1m"],
    [3599, "59m"],
    [3600, "1h 0m"],
    [3725.6, "1h 2m"],
    [86_399, "23h 59m"],
    [86_400, "1d 0h"],
    [90_061, "1d 1h"],
  ];

  test.each(cases)("%p seconds reads %p", (seconds, expected) => {
    expect(formatUptime(seconds)).toBe(expected);
  });
});

function health(status: SystemHealth["data"]["status"]): SystemHealth {
  return {
    success: true,
    timestamp: "2026-10-05T12:00:00.000Z",
    data: { status, uptime: 1234, memory: { used: 50, total: 100 }, services: {} },
  };
}

function cogworks(online: boolean, uptime: number): CogworksStatus {
  return {
    online,
    uptime,
    ping: 42,
    guilds: 3,
    users: 120,
    lastRestart: "2026-10-04T00:00:00.000Z",
    timestamp: "2026-10-05T12:00:00.000Z",
  };
}

describe("fetchServices", () => {
  afterEach(() => {
    mock.restore();
  });

  async function servicesById() {
    const services = await fetchServices();
    return new Map(services.map((s) => [s.id, s]));
  }

  test("shows the API and Cogworks online when both checks pass", async () => {
    spyOn(ninsysAPI, "getSystemHealth").mockResolvedValue(health("healthy"));
    spyOn(ninsysAPI, "getCogworksStatus").mockResolvedValue(cogworks(true, 90_061));

    const services = await servicesById();
    const api = services.get("api");
    const bot = services.get("cogworks");

    expect(api?.status).toBe("online");
    expect(bot?.status).toBe("online");
    expect(bot?.uptime).toBe("1d 1h");
    expect(Number.isNaN(Date.parse(api?.lastUpdated ?? ""))).toBe(false);
    expect(Number.isNaN(Date.parse(bot?.lastUpdated ?? ""))).toBe(false);
  });

  test("shows the API offline when its health is degraded", async () => {
    spyOn(ninsysAPI, "getSystemHealth").mockResolvedValue(health("degraded"));
    spyOn(ninsysAPI, "getCogworksStatus").mockResolvedValue(cogworks(true, 60));

    expect((await servicesById()).get("api")?.status).toBe("offline");
  });

  test("shows Cogworks offline when the bot reports it is down", async () => {
    spyOn(ninsysAPI, "getSystemHealth").mockResolvedValue(health("healthy"));
    spyOn(ninsysAPI, "getCogworksStatus").mockResolvedValue(cogworks(false, 0));

    expect((await servicesById()).get("cogworks")?.status).toBe("offline");
  });

  test("shows both offline, without throwing, when the requests fail", async () => {
    spyOn(ninsysAPI, "getSystemHealth").mockRejectedValue(new Error("API Error: 502"));
    spyOn(ninsysAPI, "getCogworksStatus").mockRejectedValue(new TypeError("Failed to fetch"));

    const services = await servicesById();
    expect(services.get("api")?.status).toBe("offline");
    expect(services.get("cogworks")?.status).toBe("offline");
    expect(services.get("cogworks")?.uptime).toBeUndefined();
  });

  test("passes the statically-statused services through untouched", async () => {
    spyOn(ninsysAPI, "getSystemHealth").mockResolvedValue(health("healthy"));
    spyOn(ninsysAPI, "getCogworksStatus").mockResolvedValue(cogworks(true, 60));

    const services = await servicesById();
    const fixed = [...services.values()].filter((s) => s.id !== "api" && s.id !== "cogworks");

    expect(fixed.length).toBeGreaterThan(0);
    for (const service of fixed) {
      expect(service.status).not.toBe("loading");
      expect(service.lastUpdated).toBeUndefined();
    }
  });
});
