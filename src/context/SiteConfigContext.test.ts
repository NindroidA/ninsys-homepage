import { describe, expect, test } from "bun:test";
import { DEFAULT_SITE_CONFIG } from "../types/siteConfig";
import { reconcile } from "./SiteConfigContext";

// reconcile() turns whatever localStorage holds (possibly written by an older
// build) into a config with the current sections and Hosted entries.
const sectionIds = DEFAULT_SITE_CONFIG.sections.map((s) => s.id);
const defaultSection = (id: string) => DEFAULT_SITE_CONFIG.sections.find((s) => s.id === id);

describe("reconcile", () => {
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

  test("reconciles the Hosted shelf the same way", () => {
    const [first, second, ...rest] = DEFAULT_SITE_CONFIG.hosted;
    if (!first || !second) throw new Error("the defaults need at least two Hosted entries");
    const config = reconcile({
      hosted: [
        { id: second.id, visible: false },
        { id: "retired-project", visible: true },
        { id: first.id },
        { id: second.id, visible: true },
      ],
    });
    expect(config.hosted).toEqual([
      { id: second.id, visible: false },
      { id: first.id, visible: true },
      ...rest,
    ]);
  });
});
