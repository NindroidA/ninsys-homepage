import { describe, expect, test } from "bun:test";
import { DEFAULT_SITE_CONFIG, type HostedEntry } from "../types/siteConfig";
import { HOSTED_LIMITS, reconcile, safeUrl, toWire } from "./siteConfig";

// reconcile() turns whatever the API, the cache or an older build's localStorage
// holds into a config with the current sections and usable Hosted entries.
const sectionIds = DEFAULT_SITE_CONFIG.sections.map((s) => s.id);
const defaultSection = (id: string) => DEFAULT_SITE_CONFIG.sections.find((s) => s.id === id);

const entry = (overrides: Partial<HostedEntry> = {}): HostedEntry => ({
  id: "lab-tool",
  name: "Lab Tool",
  description: "Does lab things.",
  status: "live",
  url: "https://lab.example.com",
  icon: "wrench",
  stack: ["Go"],
  visible: true,
  ...overrides,
});

describe("reconcile: sections", () => {
  const unusable: [label: string, raw: unknown][] = [
    ["undefined", undefined],
    ["null", null],
    ["a string", "not a config"],
    ["a number", 42],
    ["an array", []],
    ["an empty object", {}],
    ["non-array lists", { sections: "status", hosted: { id: "pluginator" } }],
  ];

  test.each(unusable)("falls back to the defaults for %s", (_label, raw) => {
    const config = reconcile(raw);
    expect(config.sections).toEqual(DEFAULT_SITE_CONFIG.sections);
    expect(config.hosted).toEqual(DEFAULT_SITE_CONFIG.hosted);
  });

  test("keeps the stored section order and visibility; a missing flag means visible", () => {
    const config = reconcile({
      sections: [{ id: "nav", visible: false }, { id: "hosted" }, { id: "status", visible: true }],
    });
    expect(config.sections.map((s) => [s.id, s.visible])).toEqual([
      ["nav", false],
      ["hosted", true],
      ["status", true],
    ]);
  });

  test("appends sections missing from storage, with their defaults", () => {
    const config = reconcile({ sections: [{ id: "nav", visible: false }] });
    expect(config.sections[0]?.id).toBe("nav");
    expect(config.sections[0]?.visible).toBe(false);
    expect(config.sections.slice(1)).toEqual(
      DEFAULT_SITE_CONFIG.sections.filter((s) => s.id !== "nav"),
    );
  });

  test("drops unknown ids, repeated ids and malformed entries", () => {
    const config = reconcile({
      sections: [
        null,
        7,
        "status",
        { id: "railways", visible: true },
        { id: "nav", visible: false },
        { id: "nav", visible: true },
      ],
    });
    expect(config.sections.map((s) => s.id)).toEqual([
      "nav",
      ...sectionIds.filter((id) => id !== "nav"),
    ]);
    expect(config.sections[0]?.visible).toBe(false);
  });

  test("takes labels from the defaults, not from storage", () => {
    const config = reconcile({
      sections: [{ id: "status", label: "Stale label", visible: true }],
    });
    for (const section of config.sections) {
      expect(section.label).toBe(defaultSection(section.id)?.label ?? "missing default");
    }
  });
});

describe("reconcile: Hosted shelf", () => {
  const [first, second, ...rest] = DEFAULT_SITE_CONFIG.hosted;
  if (!first || !second) throw new Error("the defaults need at least two Hosted entries");

  test("keeps stored entries in order and doesn't bring deleted built-ins back", () => {
    const config = reconcile({ hosted: [entry(), { ...second, visible: false }] });
    expect(config.hosted).toEqual([entry(), { ...second, visible: false }]);
  });

  test("an empty list is an empty shelf", () => {
    expect(reconcile({ hosted: [] }).hosted).toEqual([]);
  });

  test("expands an older build's { id, visible } list and appends built-ins it didn't know", () => {
    const config = reconcile({
      hosted: [
        { id: second.id, visible: false },
        { id: "retired-project", visible: true },
        { id: first.id },
        { id: second.id, visible: true },
      ],
    });
    expect(config.hosted).toEqual([
      { ...second, visible: false },
      { ...first, visible: true },
      ...rest,
    ]);
  });

  test("drops entries without a usable id, name or status, and repeated ids", () => {
    const config = reconcile({
      hosted: [
        entry({ id: "Bad Id" }),
        entry({ id: "no-name", name: "   " }),
        { ...entry({ id: "no-status" }), status: "retired" },
        entry(),
        entry({ name: "Duplicate" }),
        "lab-tool",
        null,
      ],
    });
    expect(config.hosted).toEqual([entry()]);
  });

  test("strips links that aren't absolute http(s) URLs", () => {
    const [cleaned] = reconcile({
      hosted: [entry({ url: "javascript:alert(1)", repoUrl: "data:text/html,hi" })],
    }).hosted;
    expect(cleaned?.url).toBeUndefined();
    expect(cleaned?.repoUrl).toBeUndefined();
    const relative = reconcile({
      hosted: [
        entry({ id: "relative", url: "/projects", repoUrl: "https://github.com/NindroidA/x" }),
      ],
    }).hosted[0];
    expect(relative?.url).toBeUndefined();
    expect(relative?.repoUrl).toBe("https://github.com/NindroidA/x");
  });

  test("cleans the icon, description and stack tags", () => {
    const [cleaned] = reconcile({
      hosted: [
        {
          ...entry(),
          icon: "<svg>",
          description: "  padded  ",
          stack: [" Go ", "", 7, "x".repeat(40), "a", "b", "c", "d", "e"],
        },
      ],
    }).hosted;
    expect(cleaned?.icon).toBe("server");
    expect(cleaned?.description).toBe("padded");
    expect(cleaned?.stack).toEqual(["Go", "x".repeat(HOSTED_LIMITS.tag), "a", "b", "c", "d"]);
  });

  test(`keeps at most ${HOSTED_LIMITS.entries} entries`, () => {
    const many = Array.from({ length: HOSTED_LIMITS.entries + 5 }, (_, i) =>
      entry({ id: `e-${i}` }),
    );
    expect(reconcile({ hosted: many }).hosted).toHaveLength(HOSTED_LIMITS.entries);
  });
});

describe("safeUrl", () => {
  test.each([
    ["https://nindroidsystems.com", "https://nindroidsystems.com"],
    ["  http://example.com/x  ", "http://example.com/x"],
  ])("keeps %p", (input, expected) => {
    expect(safeUrl(input)).toBe(expected);
  });

  test.each([
    "javascript:alert(1)",
    "data:text/html,hi",
    "ftp://example.com",
    "/relative",
    "example.com",
    "",
    42,
    `https://example.com/${"a".repeat(HOSTED_LIMITS.url)}`,
  ])("drops %p", (input) => {
    expect(safeUrl(input)).toBeUndefined();
  });
});

describe("toWire", () => {
  test("sends section ids and visibility, not labels", () => {
    const wire = toWire(DEFAULT_SITE_CONFIG);
    expect(wire.sections).toEqual(sectionIds.map((id) => ({ id, visible: true })));
    expect(wire.hosted).toEqual(DEFAULT_SITE_CONFIG.hosted);
  });

  test("round-trips through reconcile", () => {
    const config = reconcile({ hosted: [entry(), entry({ id: "two", visible: false })] });
    expect(reconcile(JSON.parse(JSON.stringify(toWire(config))))).toEqual(config);
  });
});
